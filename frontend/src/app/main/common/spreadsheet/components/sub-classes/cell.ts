import {
	ElementRef,
	EventEmitter
} from '@angular/core';
import _ from 'lodash';

import {
	Debounce,
	Throttle
} from '@core';

import {
	CUBScrollBarDirective
} from '@cub/material/scroll-bar';

import {
	DateField,
	DropdownField,
	FieldValidationErrors,
	LinkField,
	ParagraphField,
	PhoneField
} from '@main/common/field/objects';
import {
	DataType,
	LinkData,
	ParagraphData,
	PhoneData
} from '@main/common/field/interfaces';

import {
	VirtualScrollComponent
} from '../sub-components/virtual-scroll/virtual-scroll.component';

import {
	BaseClass,
	Dimension
} from './base';
import type {
	Column
} from './column';
import type {
	LayoutProperties
} from './main';
import type {
	Row,
	RowCellData
} from './row';

export type CellIndex = {
	rowIndex: number;
	columnIndex: number;
};

export type CellOffset = {
	left: number;
	top: number;
};

export type CellDataEditedEvent = {
	row: Row;
	newData: RowCellData;
};

export type CellSelectedEvent = {
	row: Row;
	column: Column;
};

enum ExcludeCellType {
	Required,
	Empty,
	NonEditable,
};

type SelectCellByKeyboardDirection = 'above'
	| 'below'
	| 'before'
	| 'after';

type SelectedCell = {
	row: Row;
	column: Column;
};

function parseCellKey(
	rowIndex: number,
	columnIndex: number
): string {
	return `${rowIndex}-${columnIndex}`;
}

export class CellClass extends BaseClass {

	public cellDataEdited: EventEmitter<CellDataEditedEvent[]>;
	public cellSelected: EventEmitter<CellSelectedEvent[] | null>;

	private _stacking: Map<
		Row[ 'id' ],
		CellDataEditedEvent
	>;

	get cellLine(): number {
		let line: number;

		switch ( this.config.row.size ) {
			case 'S':
				line = 1;
				break;
			case 'M':
				line = 2;
				break;
			case 'L':
				line = 3;
				break;
			case 'XL':
				line = 4;
				break;
		}

		return line;
	}

	get hasSelectingCell(): boolean {
		return !!this
		.layoutProperties
		.cell
		.selection
		?.first;
	}

	/**
	 * @param {Row} row
	 * @param {Column=} column
	 * @return {void}
	 */
	public scrollToCell(
		row: Row,
		column: Column = this.displayingColumns?.[ 0 ]
	) {
		if ( !row || !column ) {
			return;
		}

		this._scrollToCell(
			this.findRowIndexByID( row.id ),
			this.findColumnIndexByID( column.id )
		);
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @param {any} data
	 * @return {void}
	 */
	protected onCellEdited(
		row: Row,
		column: Column,
		data: any
	) {
		const newData: RowCellData
			= { [ column.id ]: data };
		let rawData: RowCellData;

		switch ( column.field.dataType ) {
			case DropdownField.dataType:
				if ( data?.newOptions?.length ) {
					rawData = {
						[ column.id ]: _.omit(
							data,
							'newOptions'
						),
					};
				}
				break;
		}

		this._markCellDataEdited(
			row,
			newData,
			rawData
		);
		this._emitCellDataEdited();

		this.calculateByColumn( column );
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @param {FieldValidationErrors | null} errors
	 * @return {void}
	 */
	protected onCellValidated(
		row: Row,
		column: Column,
		errors: FieldValidationErrors | null
	) {
		let invalid: LayoutProperties[ 'cell' ][ 'invalid' ]
			= null;

		if ( errors !== null ) {
			invalid = {
				rowIndex:
					this.findRowIndexByID( row.id ),
				columnIndex:
					this.findColumnIndexByID( column.id ),
			};
		}

		this
		.layoutProperties
		.cell
		.invalid = invalid;

		this.detectChanges();
	}

	/**
	 * @param {Row[ 'id' ]} rowID
	 * @param {Column[ 'id' ]} columnID
	 * @return {void}
	 */
	protected focusToCell(
		rowID: Row[ 'id' ],
		columnID: Column[ 'id' ]
	) {
		const rowIndex: number
			= this.findRowIndexByID( rowID );
		const columnIndex: number
			= this.findColumnIndexByID( columnID );

		this._scrollToCell(
			rowIndex,
			columnIndex
		);
	}

	/**
	 * @param {number} rowIndex
	 * @param {number} columnIndex
	 * @return {void}
	 */
	protected selectCell(
		rowIndex: number,
		columnIndex: number
	) {
		const firstCellIndex: CellIndex
			= this
			.layoutProperties
			.cell
			.selection
			?.first;

		if ( firstCellIndex
			&& firstCellIndex.rowIndex
				=== rowIndex
			&& firstCellIndex.columnIndex
				=== columnIndex ) {
			return;
		}

		this.deselectAllRows();
		this.deselectAllColumns();

		const map: LayoutProperties[ 'cell' ][ 'selection' ][ 'map' ]
			= new Map();
		const first: CellIndex
			= { rowIndex, columnIndex };

		map.set(
			parseCellKey(
				rowIndex,
				columnIndex
			),
			first
		);

		this
		.layoutProperties
		.cell
		.selection = { first, map };

		this
		.layoutProperties
		.cell
		.focusing = first;

		this._scrollToCell(
			rowIndex,
			columnIndex
		);

		const row: Row
			= this.rows[ rowIndex ];
		const column: Column
			= this.displayingColumns[ columnIndex ];

		this._emitCellSelected([
			{ row, column },
		]);

		this.markForCheck();
	}

	/**
	 * @param {[ number, number ]}
	 * @param {[ number, number ]}
	 * @return {void}
	 */
	protected selectCells(
		[
			startRowIndex,
			endRowIndex,
		]: [ number, number ],
		[
			startColumnIndex,
			endColumnIndex,
		]: [ number, number ]
	) {
		this.deselectAllRows();
		this.deselectAllColumns();

		const map: LayoutProperties[ 'cell' ][ 'selection' ][ 'map' ]
			= new Map();
		const first: CellIndex
			= {
				rowIndex: startRowIndex,
				columnIndex: startColumnIndex,
			};

		map.set(
			parseCellKey(
				first.rowIndex,
				first.columnIndex
			),
			first
		);

		if ( startRowIndex > endRowIndex ) {
			startRowIndex = -startRowIndex;
			endRowIndex = -endRowIndex;
		}

		if ( startColumnIndex > endColumnIndex ) {
			startColumnIndex = -startColumnIndex;
			endColumnIndex = -endColumnIndex;
		}

		const events: CellSelectedEvent[]
			= [];

		for (
			let i: number = startRowIndex;
			i <= endRowIndex;
			i++
		) {
			const rowIndex: number
				= Math.abs( i );
			const row: Row
				= this.rows[ rowIndex ];

			for (
				let j: number = startColumnIndex;
				j <= endColumnIndex;
				j++
			) {
				const columnIndex: number
					= Math.abs( j );
				const column: Column
					= this.displayingColumns[ columnIndex ];

				map.set(
					parseCellKey(
						rowIndex,
						columnIndex
					),
					{ rowIndex, columnIndex }
				);

				events.push({ row, column });
			}
		}

		this
		.layoutProperties
		.cell
		.selection = { first, map };

		this
		.layoutProperties
		.cell
		.focusing = first;

		this._emitCellSelected( events );
	}

	/**
	 * @param {string} text
	 * @return {void}
	 */
	protected pasteSelectedCells( text: string ) {
		const [ cells, includeCells ]: [
			Map<string, SelectedCell>,
			Map<string, SelectedCell>
		] = this.getSelectedCells([
			ExcludeCellType.NonEditable,
		]);
		let count: number = 0;

		if ( includeCells.size ) {
			const rows: Set<Row>
				= new Set();
			const recalculation: Set<Column>
				= new Set();
			const newData: RowCellData
				= {};

			for ( const { row, column }
				of includeCells.values() ) {
				const data: any
					= column
					.field
					.convertTextToData( text );

				if ( data === undefined
					|| column
					.field
					.compareData(
						data,
						row.data?.[ column.id ]
					) ) {
					continue;
				}

				newData[ column.id ] = data;

				rows.add( row );

				if ( column.calculatingType ) {
					recalculation.add( column );
				}

				count++;
			}

			if ( count ) {
				rows
				.forEach(( r: Row ) => {
					this._markCellDataEdited(
						r,
						newData
					);
				});

				this._emitCellDataEdited();

				recalculation
				.forEach(( column: Column ) => {
					this.calculateByColumn( column );
				});
			}
		}

		this.toastService.info(
			`Paste complete: ${count}/${cells.size} cells`,
			{ translate: false }
		);
	}

	/**
	 * @return {void}
	 */
	protected clearSelectedCells() {
		const [ cells, includeCells ]: [
			Map<string, SelectedCell>,
			Map<string, SelectedCell>
		] = this.getSelectedCells([
			ExcludeCellType.Required,
			ExcludeCellType.Empty,
			ExcludeCellType.NonEditable,
		]);
		let count: number = 0;

		if ( includeCells.size ) {
			const rows: Set<Row>
				= new Set();
			const recalculation: Set<Column>
				= new Set();
			const newData: RowCellData
				= {};

			for ( const { row, column }
				of includeCells.values() ) {
				let data: any = null;

				switch ( column.field.dataType ) {
					case DataType.Checkbox:
						data ||= false;
						break;
					case DataType.Rating:
						data ||= null;
						break;
				}

				newData[ column.id ] = data;

				rows.add( row );

				if ( column.calculatingType ) {
					recalculation.add( column );
				}

				count++;
			}

			if ( count ) {
				rows
				.forEach(( r: Row ) => {
					this._markCellDataEdited(
						r,
						newData
					);
				});

				this._emitCellDataEdited();

				recalculation
				.forEach(( column: Column ) => {
					this.calculateByColumn( column );
				});
			}
		}

		// TODO check
		if ( count ) {
			this.toastService.info(
				`Clear complete: ${count}/${cells.size} cells`,
				{ translate: false }
			);
		}
	}

	/**
	 * @param {KeyboardEvent} e
	 * @param {SelectCellByKeyboardDirection} direction
	 * @return {void}
	 */
	protected selectCellByKeyboard(
		e: KeyboardEvent,
		direction: SelectCellByKeyboardDirection
	) {
		if ( !this.hasSelectingCell ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		let {
			rowIndex,
			columnIndex,
		}: CellIndex
			= this
			.layoutProperties
			.cell
			.selection
			?.first;

		switch ( direction ) {
			case 'above':
				rowIndex--;
				break;
			case 'below':
				rowIndex++;
				break;
			case 'before':
				columnIndex--;
				break;
			case 'after':
				columnIndex++;
				break;
		}

		if ( rowIndex < 0 ) {
			rowIndex = 0;
		} else if (
			rowIndex > this.getLastRowIndex()
		) {
			rowIndex = this.getLastRowIndex();
		}

		if ( columnIndex < 0 ) {
			columnIndex = 0;
		} else if (
			columnIndex > this.getLastColumnIndex()
		) {
			columnIndex = this.getLastColumnIndex();
		}

		this.selectCell(
			rowIndex,
			columnIndex
		);
	}

	/**
	 * @return {void}
	 */
	protected deselectAllCells() {
		if ( !this.hasSelectingCell ) {
			return;
		}

		this.layoutProperties.cell.selection
			= this.layoutProperties.cell.focusing
			= null;

		this.cellSelected.emit( null );
	}

	/**
	 * @return {void}
	 */
	protected scrollToFocusingCell() {
		const {
			rowIndex,
			columnIndex,
		}: LayoutProperties[ 'cell'][ 'focusing' ]
			= this
			.layoutProperties
			.cell
			.focusing;

		this._scrollToCell(
			rowIndex,
			columnIndex
		);
	}

	/**
	 * @param {ExcludeCellType[]=} excludeTypes
	 * @return {[ Map<string, SelectedCell>, Map<string, SelectedCell> ]}
	 */
	protected getSelectedCells(
		excludeTypes?: ExcludeCellType[]
	): [
		Map<string, SelectedCell>,
		Map<string, SelectedCell>
	] {
		const cellMap: Map<string, SelectedCell>
			= new Map();

		if ( this.hasSelectingCell ) {
			const {
				map: cellSelectioMap,
			}: LayoutProperties[ 'cell' ][ 'selection' ]
				= this
				.layoutProperties
				.cell
				.selection;

			for ( const [ k, v ] of cellSelectioMap ) {
				const row: Row
					= this.rows[ v.rowIndex ];
				const column: Column
					= this.displayingColumns[ v.columnIndex ];

				cellMap.set(
					k,
					{ row, column }
				);
			}
		}

		if ( this.hasSelectingColumn ) {
			const {
				map: columnSelectionMap,
			}: LayoutProperties[ 'column' ][ 'selection' ]
				= this
				.layoutProperties
				.column
				.selection;

			for (
				let rowIndex: number = 0;
				rowIndex < this.rows.length;
				rowIndex++
			) {
				const row: Row
					= this.rows[ rowIndex ];

				for ( const [ columnIndex, column ]
					of columnSelectionMap ) {
					cellMap.set(
						parseCellKey(
							rowIndex,
							columnIndex
						),
						{ row, column }
					);
				}
			}
		}

		if ( this.selectedRows ) {
			for ( const row of this.selectedRows ) {
				const rowIndex: number
					= this.findRowIndexByID( row.id );

				for (
					let columnIndex: number = 0;
					columnIndex
						< this.displayingColumns.length;
					columnIndex++
				) {
					const column: Column
						= this.displayingColumns[ columnIndex ];

					cellMap.set(
						parseCellKey(
							rowIndex,
							columnIndex
						),
						{ row, column }
					);
				}
			}
		}

		const includeCellMap: Map<string, SelectedCell>
			= new Map( cellMap );

		if ( excludeTypes?.length ) {
			const excludeRequired: boolean
				= _.includes(
					excludeTypes,
					ExcludeCellType.Required
				);
			const excludeEmpty: boolean
				= _.includes(
					excludeTypes,
					ExcludeCellType.Empty
				);
			const excludeNonEditable: boolean
				= _.includes(
					excludeTypes,
					ExcludeCellType.NonEditable
				);

			for ( const [ key, { row, column } ]
				of includeCellMap ) {
				if ( ( !excludeRequired
						|| !column.field.isRequired )
					&& ( !excludeEmpty
						|| ( column.field.dataType
								=== DataType.Checkbox
							? row.data?.[ column.id ] === true
							: !_.isStrictEmpty(
								row.data?.[ column.id ]
							) ) )
					&& ( !excludeNonEditable
						|| ( !column.field.isInvalid
							&& ( column.editable
								|| row.editable === true
								|| row.editable?.[ column.id ]
									=== true ) ) ) ) {
					continue;
				}

				includeCellMap.delete( key );
			}
		}

		return [
			cellMap,
			includeCellMap,
		];
	}

	/**
	 * @param {number} rowIndex
	 * @param {number} columnIndex
	 * @return {CellOffset}
	 */
	protected getCellOffset(
		rowIndex: number,
		columnIndex: number
	): CellOffset {
		if ( this.isGrouping ) {
			return this.getRowCellOffsetInGroup(
				rowIndex,
				columnIndex
			);
		}

		const left: number
			= this
			.layoutProperties
			.column
			.offsets[ columnIndex ];
		const top: number
			= rowIndex * this.rowHeight;

		return { left, top };
	}

	/**
	 * @param {HTMLElement} target
	 * @return {CellIndex}
	 */
	protected findCellByTargetElement(
		target: HTMLElement
	): CellIndex {
		const cell: ElementRef
			= this.selectableRowCells
			.find(( { nativeElement }: ElementRef ) => {
				return nativeElement === target
					|| nativeElement.contains( target );
			});

		if ( !cell ) return;

		const rowIndex: number
			= parseFloat(
				cell
				.nativeElement
				.getAttribute( 'data-row-index' )
			);
		const columnIndex: number
			= parseFloat(
				cell
				.nativeElement
				.getAttribute( 'data-column-index' )
			);

		return { rowIndex, columnIndex };
	}

	/**
	 * @param {Row[]} rows
	 * @param {RowCellData} newData
	 * @return {void}
	 */
	protected updateCellsData(
		rows: Row[],
		newData: RowCellData
	) {
		for ( const row of rows ) {
			this._markCellDataEdited(
				row,
				newData
			);
		}

		this._emitCellDataEdited();

		this.calculate();
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @return {string}
	 */
	protected searchCellPredicate(
		row: Row,
		column: Column
	): string {
		return this._parseSearchValue(
			row,
			column
		);
	}

	/**
	 * @param {number} rowIndex
	 * @param {number} columnIndex
	 * @return {void}
	 */
	private _scrollToCell(
		rowIndex: number,
		columnIndex: number
	) {
		if ( rowIndex === -1
			|| columnIndex === -1
			|| _.isNil( rowIndex )
			|| _.isNil( columnIndex ) ) {
			return;
		}

		const {
			horizontalTrackOffsetX,
			verticalTrackOffsetY,
			viewportWidth,
			viewportHeight,
		}: VirtualScrollComponent
			= this.virtualScroll;

		const { width: cellWidth }: Column
			= this.displayingColumns[ columnIndex ];
		const cellHeight: number
			= this.rowHeight;
		const {
			left: cellOffsetLeft,
			top: cellOffsetTop,
		}: CellOffset
			= this.getCellOffset(
				rowIndex,
				columnIndex
			);
		const {
			scrollLeft,
			scrollTop,
		}: Partial<CUBScrollBarDirective>
			= this.virtualScroll.scrollBar;
		let left: number = scrollLeft;
		let top: number = scrollTop;

		if ( cellOffsetLeft
				>= horizontalTrackOffsetX ) {
			if (
				cellOffsetLeft - horizontalTrackOffsetX
					< scrollLeft
			) {
				left -= scrollLeft
					- cellOffsetLeft
					+ horizontalTrackOffsetX;
			} else if (
				( cellOffsetLeft + cellWidth )
					> ( scrollLeft + viewportWidth )
			) {
				left += ( cellOffsetLeft + cellWidth )
					- ( scrollLeft + viewportWidth );
			}
		}

		if ( cellOffsetTop
				>= verticalTrackOffsetY ) {
			if (
				cellOffsetTop - verticalTrackOffsetY
					< scrollTop
			) {
				top -= scrollTop
					- cellOffsetTop
					+ verticalTrackOffsetY
					- Dimension.PaneVerticalPadding;
			} else if (
				( cellOffsetTop + cellHeight )
					> ( scrollTop + viewportHeight )
			) {
				top += ( cellOffsetTop + cellHeight )
					- ( scrollTop + viewportHeight )
					+ Dimension.PaneVerticalPadding;
			}
		}

		this.virtualScroll.scrollTo(
			{ left, top }
		);
	}

	/**
	 * @param {Row} row
	 * @param {RowCellData} newData
	 * @return {void}
	 */
	private _markCellDataEdited(
		row: Row,
		newData: RowCellData,
		rawData: RowCellData = newData
	) {
		row.data = {
			...row.data,
			...rawData,
		};

		this._stacking ||= new Map();

		let event: CellDataEditedEvent
			= this._stacking.get( row.id );

		if ( !event ) {
			this._stacking.set(
				row.id,
				event = { row, newData }
			);
			return;
		}

		event.newData = {
			...event.newData,
			...newData,
		};
	}

	/**
	 * @return {void}
	 */
	@Throttle( 2000 )
	private _emitCellDataEdited() {
		if ( !this._stacking?.size ) {
			return;
		}

		this.cellDataEdited.emit([
			...this._stacking.values(),
		]);

		this._stacking.clear();
	}

	/**
	 * @param {CellSelectedEvent[]} events
	 * @return {void}
	 */
	@Debounce( 200 )
	private _emitCellSelected(
		events: CellSelectedEvent[]
	) {
		this.cellSelected.emit(
			events
		);
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @return {string}
	 */
	private _parseSearchValue(
		row: Row,
		column: Column
	): string {
		let data: any
			= row.data?.[ column.id ] ?? '';

		switch ( column.field.dataType ) {
			case DateField.dataType:
				// data = this.momentDatePipe.transform( data );
				break;
			case ParagraphField.dataType:
				data = ( data as ParagraphData );
				data = data.text;
				break;
			case PhoneField.dataType:
				data = ( data as PhoneData );
				data = data.phone;
				break;
			case LinkField.dataType:
				data = ( data as LinkData );
				data = data.text || data.link;
				break;
		}

		return String( data );
	}

}
