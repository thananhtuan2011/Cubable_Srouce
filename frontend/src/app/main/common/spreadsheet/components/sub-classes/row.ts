import {
	EventEmitter
} from '@angular/core';
import {
	CdkDragDrop,
	CdkDragMove,
	CdkDragStart,
	Point
} from '@angular/cdk/drag-drop';
import {
	isObservable,
	Observable,
	of
} from 'rxjs';
import {
	ulid,
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	BaseClass,
	Dimension
} from './base';
import type {
	Column
} from './column';
import type {
	Group
} from './group';
import type {
	Config
} from './main';

// eslint-disable-next-line @typescript-eslint/typedef
export const ROW_SIZES
	= [ 'S', 'M', 'L', 'XL' ] as const;

export enum RowSelectionMode {
	None,
	Single,
	Multiple,
}

export type RowSize
	= typeof ROW_SIZES[ number ];

export type Row = {
	id: ULID;
	data: RowCellData;
	content?: RowCellContent;
	warning?: RowCellWarning;

	editable?: boolean
		| Record<Column[ 'id' ], boolean>;
	deletable?: boolean;

	selected?: boolean;
};

export type RowCellData
	= Record<Column[ 'id' ], any>;
export type RowCellContent
	= Record<Column[ 'id' ], string>;
export type RowCellWarning
	= Record<Column[ 'id' ], boolean | string>;

export type FoundRow = {
	rowIndex: number;
	rowOffset: number;
	row: Row;
	group?: Group;
};

export type RowDuplicatedEvent = {
	row: Row;
	sourceRow: Row;
	position: number;
};

export type RowInsertedEvent = {
	row: Row;
	position: number;
};

export type RowMovedEvent = {
	rows: Row[];
	position: number;
};

enum RowSizeEnum {
	S = 32,
	M = 56,
	L = 92,
	XL = 128,
};

export class RowClass extends BaseClass {

	public rows: Row[];

	public rowsChange: EventEmitter<Row[]>;
	public rowAdded: EventEmitter<Row>;
	public rowDeleted: EventEmitter<Row[]>;
	public rowDuplicated: EventEmitter<RowDuplicatedEvent>;
	public rowExpanded: EventEmitter<Row>;
	public rowInserted: EventEmitter<RowInsertedEvent>;
	public rowMoved: EventEmitter<RowMovedEvent>;
	public rowSelected: EventEmitter<Row[] | null>;

	protected selectedRows: Row[];
	protected rowsBk: Row[];
	protected draggingRows: Map<Row[ 'id' ], Row>;

	get rowHeight(): number {
		return RowSizeEnum[ this.config.row.size ];
	}

	get canDeleteSelectedRows(): boolean {
		return !_.find(
			this.selectedRows,
			{ deletable: false }
		);
	}

	get canSelectRow(): boolean {
		return !!this.config.row.selectionMode;
	}

	get canSelectMultipleRows(): boolean {
		return this.config.row.selectionMode
				=== RowSelectionMode.Multiple;
	}

	get hasSelectingRow(): boolean {
		return !!this.selectedRows?.length;
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	public pushRows( rows: Row[] ) {
		const rowLookup: Record<Row[ 'id' ], Row>
			= _.keyBy( this.rows, 'id' );
		const newRows: Row[]
			= _.filter(
				rows,
				( row: Row ): boolean => {
					return !rowLookup[ row.id ];
				}
			);

		if ( !newRows.length ) {
			return;
		}

		if ( !this.rows ) {
			this.rowsChange.emit(
				this.rows = []
			);
		}

		this.rows.push( ...newRows );

		this.rowsBk ||= [];
		this.rowsBk.push( ...newRows );

		this.updateRows( rows );
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	public updateRows( rows: Row[] ) {
		const selectedRows: Set<Row>
			= new Set( this.selectedRows );
		let hasNewSelectedRows: boolean;

		_.forEach(
			rows,
			( row: Row ) => {
				row.id ||= ulid();

				_.defaultsDeep(
					row,
					this.config.row.default
				);

				hasNewSelectedRows
					||= row.selected
						&& !selectedRows.has( row );
			}
		);

		if ( hasNewSelectedRows ) {
			this.selectedRows
				= _.filter(
					this.rows,
					{ selected: true }
				);
		}

		this.calculate();
		this.group();
		this.sort();

		this.virtualScroll.markForCheck();
	}

	/**
	 * @param {RowSize} size
	 * @return {void}
	 */
	public setRowSize( size: RowSize ) {
		this.config.row.size = size;

		if ( this.isGrouping ) {
			this.updateGroupOffsets();
		}

		this.virtualScroll.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public addRow() {
		this.isGrouping
			? this.createRowInGroup()
			: this.createRow();
	}

	/**
	 * @param {CdkDragStart} e
	 * @return {void}
	 */
	protected onRowDragStarted(
		e: CdkDragStart
	) {
		this.deselectAllCells();

		const draggingRow: Row
			= e.source.data;

		if ( !this.draggingRows ) {
			this.draggingRows
				= new Map();
		}

		this.draggingRows.set(
			draggingRow.id,
			draggingRow
		);

		if ( !draggingRow.selected ) {
			return;
		}

		_.forEach(
			this.selectedRows,
			( row: Row ) => {
				this.draggingRows.set(
					row.id,
					row
				);
			}
		);
	}

	/**
	 * @param {CdkDragMove} e
	 * @return {void}
	 */
	protected onRowDragMoved( e: CdkDragMove ) {
		const foundRow: FoundRow
			= this.findRowAtPointerPosition(
				e.pointerPosition
			);
		let group: Group;
		let rowIndex: number;
		let rowOffset: number;

		if ( foundRow ) {
			group = foundRow.group;
			rowIndex = foundRow.rowIndex;
			rowOffset = foundRow.rowOffset
				+ Dimension.HeaderHeight
				- this.virtualScroll.scrollBar.scrollTop;
		}

		this
		.layoutProperties
		.row
		.dragOverGroup = group;
		this
		.layoutProperties
		.row
		.dragPlaceholderIndex = rowIndex;
		this
		.layoutProperties
		.row
		.dragPlaceholderOffset
			= rowOffset
				+ Dimension.PaneVerticalPadding;
	}

	/**
	 * @param {CdkDragDrop<Row[]>} _e
	 * @return {void}
	 */
	protected onRowsDropped(
		_e: CdkDragDrop<Row[]>
	) {
		const currentIndex: number
			= this
			.layoutProperties
			.row
			.dragPlaceholderIndex;

		this
		.layoutProperties
		.row
		.dragPlaceholderIndex = -1;

		if ( !_.isFinite( currentIndex ) ) {
			return;
		}

		const droppedRows: Row[] = [
			...this.draggingRows.values(),
		];

		this.draggingRows.clear();

		this.moveRows(
			droppedRows,
			currentIndex
		);

		if ( !this.isGrouping ) {
			return;
		}

		const targetGroup: Group
			= this
			.layoutProperties
			.row
			.dragOverGroup;

		this
		.layoutProperties
		.row
		.dragOverGroup = null;

		this.moveRowsInGroup(
			droppedRows,
			currentIndex,
			targetGroup
		);
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected expandRow( row: Row ) {
		this.rowExpanded.emit( row );
	}

	/**
	 * @param {number=} position
	 * @return {Row}
	 */
	protected createRow(
		position?: number
	): Row {
		const newRow: Row
			= this._generateRow();

		this._insertRow(
			newRow,
			position
		);

		if ( _.isFinite( position ) ) {
			this.rowInserted.emit({
				row: newRow,
				position,
			});
		} else {
			this.rowAdded.emit(
				newRow
			);
		}

		return newRow;
	}

	/**
	 * @param {Row} sourceRow
	 * @return {Row}
	 */
	protected duplicateRow(
		sourceRow: Row
	): Row {
		const newRow: Row
			= this._generateRow( sourceRow );
		const position: number
			= _.indexOf(
				this.rows,
				sourceRow
			) + 1;

		this._insertRow(
			newRow,
			position
		);

		this.rowDuplicated.emit({
			row: newRow,
			sourceRow,
			position,
		});

		return newRow;
	}

	/**
	 * @return {void}
	 */
	protected deleteSelectedRows() {
		const {
			deleteConfirmation,
		}: Config[ 'row' ]
			= this.config.row;
		let ob: Observable<boolean>
			= of( true );

		if ( deleteConfirmation === true ) {
			ob = this.confirmService
			.open(
				'SPREADSHEET.MESSAGE.DELETE_SELECTED_ROW_CONFIRMATION',
				'SPREADSHEET.MESSAGE.DELETE_SELECTED_ROW_TITLE',
				{
					warning: true,
					buttonApply: {
						text: 'SPREADSHEET.LABEL.DELETE',
						type: 'destructive',
					},
					translate: {
						length: this.selectedRows.length,
					},
					buttonDiscard: 'SPREADSHEET.LABEL.CANCEL',
				}
			)
			.afterClosed();
		} else if (
			isObservable( deleteConfirmation )
		) {
			ob = deleteConfirmation;
		}

		ob
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( answer: boolean ) => {
			if ( !answer ) return;

			this.markAsRowsChanged(
				_.without(
					this.rows,
					...this.selectedRows
				)
			);

			this.virtualScroll.markForCheck();

			this.rowDeleted.emit([
				...this.selectedRows,
			]);

			this.selectedRows = null;
		});
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected deleteRow( row: Row ) {
		const {
			deleteConfirmation,
		}: Config[ 'row' ]
			= this.config.row;
		let ob: Observable<boolean>
			= of( true );

		if ( deleteConfirmation === true ) {
			ob = this.confirmService
			.open(
				'SPREADSHEET.MESSAGE.DELETE_ROW_CONFIRMATION',
				'SPREADSHEET.MESSAGE.DELETE_ROW_TITLE',
				{
					warning: true,
					buttonApply: {
						text: 'SPREADSHEET.LABEL.DELETE',
						type: 'destructive',
					},
					buttonDiscard: 'SPREADSHEET.LABEL.KEEP',
				}
			)
			.afterClosed();
		} else if (
			isObservable( deleteConfirmation )
		) {
			ob = deleteConfirmation;
		}

		ob
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( answer: boolean ) => {
			if ( !answer ) return;

			this.markAsRowsChanged(
				_.without(
					this.rows,
					row
				)
			);

			_.without(
				this.rowsBk,
				row
			);

			this.virtualScroll.markForCheck();

			this.rowDeleted.emit([ row ]);
		});
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected toggleRow( row: Row ) {
		if ( !this.canSelectRow ) {
			return;
		}

		row.selected = !row.selected;

		const selectionMode: Config[ 'row' ][ 'selectionMode' ]
			= this
			.config
			.row
			.selectionMode;

		if (
			selectionMode
				=== RowSelectionMode.Multiple
		) {
			if ( !this.selectedRows ) {
				this.selectedRows = [];
			}

			const idx: number
				= _.indexOf(
					this.selectedRows,
					row
				);

			idx === -1
				? this.selectedRows.push( row )
				: this.selectedRows.splice( idx, 1 );
		} else if (
			selectionMode
				=== RowSelectionMode.Single
		) {
			_.forEach(
				this.selectedRows,
				( _row: Row ) => {
					_row.selected = false;
				}
			);

			this.selectedRows = [ row ];
		}

		this.rowSelected.emit(
			this.selectedRows
		);
	}

	/**
	 * @return {void}
	 */
	protected selectAllRows() {
		this.rowSelected.emit(
			this.selectedRows = _.filter(
				this.rows,
				( row: Row ): boolean => {
					return row.selected = true;
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	protected deselectAllRows() {
		if ( !this.hasSelectingRow ) {
			return;
		}

		_.forEach(
			this.selectedRows,
			( row: Row ) => {
				row.selected = false;
			}
		);

		this.rowSelected.emit(
			this.selectedRows = null
		);
	}

	/**
	 * @param {Row[]} movedRows
	 * @param {number} movedIndex
	 * @return {void}
	 */
	protected moveRows(
		movedRows: Row[],
		movedIndex: number
	) {
		let newMovedIndex: number
			= movedIndex;

		for ( const movedRow of movedRows ) {
			const idx: number
				= _.indexOf(
					this.rows,
					movedRow
				);

			if ( idx < 0
				|| idx >= movedIndex ) {
				continue;
			}

			newMovedIndex--;
		}

		// Remove rows at old index
		_.pull(
			this.rows,
			...movedRows
		);
		_.pull(
			this.rowsBk,
			...movedRows
		);

		// Insert rows at new index
		this.rows.splice(
			newMovedIndex,
			0,
			...movedRows
		);

		this.rowsBk ||= [];
		this.rowsBk.splice(
			newMovedIndex,
			0,
			...movedRows
		);

		this.markAsRowsChanged();

		this.rowMoved.emit({
			rows: movedRows,
			position: newMovedIndex,
		});
	}

	/**
	 * @return {number}
	 */
	protected getLastRowIndex(): number {
		return this.isGrouping
			? this.getLastRowIndexInGroup()
			: this.rows.length - 1;
	}

	/**
	 * @param {Point} pointerPosition
	 * @return {FoundRow}
	 */
	protected findRowAtPointerPosition(
		pointerPosition: Point
	): FoundRow {
		if ( this.isGrouping ) {
			return this.findRowInGroupAtPointerPosition(
				pointerPosition
			);
		}

		let { y: pointerOffsetY }: Point
			= this.virtualScroll
			.measurePointerOffset( pointerPosition );

		pointerOffsetY
			-= Dimension.PaneVerticalPadding;

		if ( !_.isFinite( pointerOffsetY )
			|| pointerOffsetY < 0 ) {
			return;
		}

		const startOffset: number = 0;
		const endOffset: number = startOffset
			+ ( this.rows.length
				* this.rowHeight );

		if ( pointerOffsetY < startOffset
			|| pointerOffsetY > endOffset ) {
			return;
		}

		const index: number = Math.round(
			( pointerOffsetY - startOffset )
				/ this.rowHeight
		);

		return {
			rowIndex: index,
			rowOffset: startOffset
				+ ( index * this.rowHeight ),
			row: this.rows[ index ],
		};
	}

	/**
	 * @param {Row[ 'id' ]} rowID
	 * @return {number}
	 */
	protected findRowIndexByID(
		rowID: Row[ 'id' ]
	): number {
		return this.isGrouping
			? this.findRowIndexInGroupByID( rowID )
			: _.findIndex(
				this.rows,
				{ id: rowID }
			);
	}

	/**
	 * @param {Row[]=} rows
	 * @return {void}
	 */
	protected markAsRowsChanged(
		rows: Row[] = this.rows
	) {
		this.rowsChange.emit(
			this.rows = [ ...rows ]
		);

		this.calculate();
	}

	/**
	 * @param {Partial<Row>=} extra
	 * @return {Row}
	 */
	private _generateRow(
		extra?: Partial<Row>
	): Row {
		return _.cloneDeep({
			...this.config.row.default,
			...extra,
			id: ulid(),
		}) as Row;
	}

	/**
	 * @param {Row} row
	 * @param {number=} position
	 * @return {void}
	 */
	private _insertRow(
		row: Row,
		position: number = this.rows?.length
	) {
		this.rows ||= [];
		this.rows.splice(
			position,
			0,
			row
		);

		this.rowsBk ||= [];
		this.rowsBk.splice(
			position,
			0,
			row
		);

		this.markAsRowsChanged();

		this.virtualScroll.markForCheck();

		setTimeout(() => {
			this.selectCell(
				this.findRowIndexByID( row.id ),
				0
			);
		});
	}

}

