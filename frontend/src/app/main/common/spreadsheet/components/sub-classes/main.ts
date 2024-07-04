import {
	EventEmitter
} from '@angular/core';
import {
	Point
} from '@angular/cdk/drag-drop';
import {
	Observable
} from 'rxjs';
import {
	Mixin
} from 'ts-mixer';
import _ from 'lodash';

import {
	CUBMenuComponent
} from '@cub/material/menu';
import {
	CUBSearchInfo
} from '@cub/material/search-box';

import {
	calculateBy
} from '../../helpers/calculate';
import {
	groupBy
} from '../../helpers/group';
import {
	searchBy
} from '../../helpers/search';
import {
	sortBy
} from '../../helpers/sort';

import {
	Dimension
} from './base';
import {
	CellClass,
	CellIndex
} from './cell';
import {
	Column,
	ColumnClass
} from './column';
import {
	Group,
	GroupClass
} from './group';
import {
	Row,
	RowClass,
	RowSelectionMode,
	RowSize
} from './row';

export enum SpreadsheetMode {
	Creator = 1,
	Editor,
	Picker,
}

export type SearchInfo = CUBSearchInfo;

export type ExportData = {
	rows: Row[];
	columns: Column[];
};

export type Action = {
	icon: string;
	label: string;
	color?: string;
	menu?: CUBMenuComponent;
	disabled?: boolean;
	hidden?: boolean;
	support?: 'single-only' | 'multiple-only';
	onClicked?: ( action: Action, rows: Row[] ) => void;
};

export type Config = {
	mode?: SpreadsheetMode;

	column?: {
		frozenIndex?: number | null;
		minResizeWidth?: number;
		deleteConfirmation?: boolean | Observable<boolean>;

		arrangeable?: boolean;
		calculable?: boolean;
		creatable?: boolean;
		freezable?: boolean;
		groupable?: boolean;
		hideable?: boolean;
		manageable?: boolean;
		resizable?: boolean;
		sortable?: boolean;

		default?: Partial<Column>;
	};

	row?: {
		startIndex?: number;
		actions?: Action[] | null;
		size?: RowSize;
		selectionMode?: RowSelectionMode;
		deleteConfirmation?: boolean | Observable<boolean>;

		arrangeable?: boolean;
		creatable?: boolean;
		expandable?: boolean;
		exportable?: boolean;
		indexable?: boolean; // Temp
		printable?: boolean;

		default?: Partial<Row>;
	};
};

export type LayoutProperties = {
	pane: {
		leftWidth?: number;
		rightWidth?: number;
	};
	frozenDivider: {
		isHover?: boolean;
		isHideHeadLine?: boolean;
		dragHandleOffset?: number;
		dragPlaceholderIndex?: number;
		dragPlaceholderOffset?: number;
	};
	column: {
		offsets?: number[];
		dragPlaceholderIndex?: number;
		dragPlaceholderOffset?: number;
		selection?: {
			first: CellIndex;
			map: Map<number, Column>;
		};
	};
	row: {
		hoverIndex?: number;
		dragOverGroup?: Group;
		dragPlaceholderIndex?: number;
		dragPlaceholderOffset?: number;
	};
	cell: {
		searching?: {
			found?: Map<
				Row[ 'id' ],
				Map<
					Column[ 'id' ],
					{
						row: Row;
						column: Column;
					}
				>
			>;
			resultIndex: number;
		};
		focusing?: CellIndex;
		selection?: {
			first: CellIndex;
			map: Map<string, CellIndex>;
		};
		invalid?: CellIndex;
	};
};

export type ActionClickedEvent = {
	action: Action;
	rows: Row[];
};

// type ExportExtension = 'csv' | 'xlsx';

export class MainClass extends Mixin(
	CellClass,
	ColumnClass,
	GroupClass,
	RowClass
) {

	public config: Config;
	public context: ObjectType;

	public searching: EventEmitter<SearchInfo>;
	public export: EventEmitter<ExportData>;

	protected layoutProperties: LayoutProperties = {
		pane: {},
		frozenDivider: {},
		column: {},
		row: {},
		cell: {},
	};
	protected isRightScrolled: boolean;
	protected searchResult: [ Row, Column ][];
	protected calculatedResult: Map<Column[ 'id' ], any>;

	protected readonly DEFAULT_CONFIG: Config = {
		mode: SpreadsheetMode.Editor,

		column: {
			frozenIndex: 0,
			minResizeWidth: 100,
			deleteConfirmation: true,

			arrangeable: true,
			calculable: true,
			creatable: true,
			freezable: true,
			groupable: true,
			hideable: true,
			manageable: true,
			resizable: true,
			sortable: true,

			default: {
				width: 180,

				editable: true,
				deletable: true,

				hidden: false,
			},
		},

		row: {
			startIndex: 0,
			size: 'M',
			selectionMode: RowSelectionMode.Multiple,
			deleteConfirmation: true,

			arrangeable: true,
			creatable: true,
			expandable: true,
			exportable: true,
			indexable: true, // Temp
			printable: false,

			default: {
				editable: true,
				deletable: true,

				selected: false,
			},
		},
	};

	get isCreatorMode(): boolean {
		return this.config.mode
				=== SpreadsheetMode.Creator;
	}

	get isEditorMode(): boolean {
		return this.config.mode
				=== SpreadsheetMode.Editor;
	}

	get isPickerMode(): boolean {
		return this.config.mode
				=== SpreadsheetMode.Picker;
	}

	get actionBoxOffset(): number {
		return (
			this.config.column.calculable
				? Dimension.FooterHeight
				: 0
		) + 16;
	}

	get virtualScrollHorizontalTrackOffset(): Point {
		return {
			x: this
			.layoutProperties
			.pane
			.leftWidth,
			y: this
			.config
			.column
			.calculable
				? -Dimension.FooterHeight
				: 0,
		};
	}

	get searchInfo(): SearchInfo {
		const total: number
			= this
			.searchResult
			?.length || 0;
		const current: number
			= total > 0
				? this
				.layoutProperties
				.cell
				.searching
				?.resultIndex + 1
				: 0;

		return { current, total };
	}

	/**
	 * @param {string} searchQuery
	 * @return {void}
	 */
	public search( searchQuery: string ) {
		let searchResult: [ Row, Column ][];
		let searching: LayoutProperties[ 'cell' ][ 'searching' ];
		let focusing: LayoutProperties[ 'cell' ][ 'focusing' ];

		if ( searchQuery ) {
			const data: [ Row, Column ][] = [];

			for ( const row of this.rows ) {
				for ( const column
					of this.displayingColumns ) {
					data.push([ row, column ]);
				}
			}

			searchResult = searchBy(
				data,
				searchQuery,
				this
				.searchCellPredicate
				.bind( this )
			);

			if ( searchResult.length ) {
				const found: LayoutProperties[ 'cell' ][ 'searching' ][ 'found' ]
					= new Map();
				let focusingRowIndex: number;
				let focusingColumnIndex: number;

				for (
					let i: number = 0;
					i < searchResult.length;
					i++
				) {
					const [ row, column ]: [ Row, Column ]
						= searchResult[ i ];
					const rowID: Row[ 'id' ]
						= row.id;
					const columnID: Column[ 'id' ]
						= column.id;
					const m: Map<
						Column[ 'id' ],
						{ row: Row; column: Column }
					> = found.get( rowID ) || new Map();

					m.set(
						columnID,
						{ row, column }
					);

					found.set( rowID, m );

					if ( i > 0 ) continue;

					focusingRowIndex
						= this.findRowIndexByID( rowID );
					focusingColumnIndex
						= this.findColumnIndexByID( columnID );
				}

				searching = {
					found,
					resultIndex: 0,
				};

				focusing = {
					rowIndex: focusingRowIndex,
					columnIndex: focusingColumnIndex,
				};
			}
		}

		this.searchResult = searchResult;

		this
		.layoutProperties
		.cell
		.searching = searching;

		this
		.layoutProperties
		.cell
		.focusing = focusing;

		this.markForCheck();

		if ( !focusing ) return;

		this.scrollToFocusingCell();
	}

	/**
	 * @param {number} previousIndex
	 * @return {void}
	 */
	public searchPrevious(
		previousIndex: number
	) {
		const searchResult: [ Row, Column ]
			= this.searchResult[ previousIndex ];

		if ( !searchResult ) {
			return;
		}

		const [
			row,
			column,
		]: [ Row, Column ] = searchResult;

		this
		.layoutProperties
		.cell
		.searching.
		resultIndex = previousIndex;

		this
		.layoutProperties
		.cell
		.focusing = {
			rowIndex:
				this.findRowIndexByID( row.id ),
			columnIndex:
				this.findColumnIndexByID( column.id ),
		};

		this.scrollToFocusingCell();

		this.markForCheck();
	}

	/**
	 * @param {number} nextIndex
	 * @return {void}
	 */
	public searchNext(
		nextIndex: number
	) {
		const searchResult: [ Row, Column ]
			= this.searchResult[ nextIndex ];

		if ( !searchResult ) {
			return;
		}

		const [
			row,
			column,
		]: [ Row, Column ] = searchResult;

		this.layoutProperties
		.cell
		.searching
		.resultIndex = nextIndex;

		this
		.layoutProperties
		.cell
		.focusing = {
			rowIndex:
				this.findRowIndexByID( row.id ),
			columnIndex:
				this.findColumnIndexByID( column.id ),
		};

		this.scrollToFocusingCell();

		this.markForCheck();
	}

	/**
	 * @param {Column[]=} columns
	 * @return {void}
	 */
	public calculate( columns?: Column[] ) {
		if ( columns === undefined ) {
			columns = [
				...this
				.calculatingColumns
				.values(),
			];
		} else {
			this.calculatingColumns.clear();

			_.forEach(
				columns,
				( column: Column ) => {
					this.calculatingColumns.set(
						column.id,
						column
					);
				}
			);
		}

		if ( !columns.length ) {
			return;
		}

		if ( this.isGrouping ) {
			this.calculateInGroup( columns );
			return;
		}

		this.calculatedResult
			||= new Map();

		for ( const column of columns ) {
			this.calculatedResult.set(
				column.id,
				 calculateBy(
					this.rows,
					column.calculatingType,
					this
					.calculateColumnPredicate
					.bind( this, column )
				)
			);
		}
	}

	/**
	 * @return {void}
	 */
	public uncalculate() {
		for (
			const column
			of this.calculatingColumns.values()
		) {
			delete column.calculatingType;
		}

		this.calculatingColumns.clear();
		this.calculatedResult.clear();
	}

	/**
	 * @param {Column[]=} columns
	 * @return {void}
	 */
	public group( columns?: Column[] ) {
		if ( columns === undefined ) {
			columns = [
				...this
				.groupingColumns
				.values(),
			];
		} else {
			this.groupingColumns.clear();

			_.forEach(
				columns,
				( column: Column ) => {
					this.groupingColumns.set(
						column.id,
						column
					);
				}
			);
		}

		if ( !columns.length ) {
			return;
		}

		this.rootGroup = groupBy(
			this.rows,
			this
			.groupColumnPredicate
			.bind( this, columns ),
			this
			.sortGroupPredicate
			.bind( this, columns ),
			this
			.parseGroupMetadataPredicate
			.bind( this, columns ),
			this.groupDepth
		);

		this.sort();
		this.calculate();

		this.updateGroupOffsets();
		this.updateColumnOffsets();

		this.markForCheck();
		this.detectChanges();

		this.virtualScroll.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public ungroup() {
		if ( !this.isGrouping ) {
			return;
		}

		for ( const column
			of this.groupingColumns.values() ) {
			delete column.groupingType;
		}

		this.rootGroup = null;

		this.groupingColumns.clear();

		this.updateColumnOffsets();

		this.markForCheck();

		this.virtualScroll.markForCheck();
	}

	/**
	 * @param {Column[]=} columns
	 * @return {void}
	 */
	public sort( columns?: Column[] ) {
		if ( columns === undefined ) {
			columns = [
				...this
				.sortingColumns
				.values(),
			];
		} else {
			this.sortingColumns.clear();

			_.forEach(
				columns,
				( column: Column ) => {
					this.sortingColumns.set(
						column.id,
						column
					);
				}
			);
		}

		if ( !columns.length ) {
			return;
		}

		if ( this.isGrouping ) {
			this.sortInGroup( columns );
			return;
		}

		this.rowsBk ||= [ ...this.rows ];

		this.rowsChange.emit(
			this.rows = sortBy(
				this.rows,
				this
				.sortColumnPredicate
				.bind( this, columns ),
				columns.length
			)
		);

		this.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public unsort() {
		for ( const column
			of this.sortingColumns.values() ) {
			delete column.sortingType;
		}

		this.sortingColumns.clear();

		if ( this.isGrouping ) {
			this.unsortInGroup();
			return;
		}

		this.rowsChange.emit(
			this.rows = [ ...this.rowsBk ]
		);

		this.markForCheck();
	}

	// /**
	//  * @param {ExportExtension} extension
	//  * @return {void}
	//  */
	// public export(
	// 	extension: ExportExtension
	// ) {
	// 	const workbook: Excel.Workbook
	// 		= new Excel.Workbook();
  	// 	const worksheet: Excel.Worksheet
	// 		= workbook.addWorksheet();

	// 	worksheet.columns = _.map(
	// 		this.displayingColumns,
	// 		( { id, field, width }: Column ): Excel.Column => {
	// 			let hAlignment: Excel.Style[ 'alignment' ][ 'horizontal' ]
	// 				= 'left';

	// 			switch ( field.dataType ) {
	// 				case DataType.Number:
	// 				case DataType.Currency:
	// 				case DataType.Rating:
	// 				case DataType.Progress:
	// 					hAlignment = 'right';
	// 					break;
	// 			}

	// 			return {
	// 				key: id,
	// 				header: field.name,
	// 				width: ( width * 0.75 ) / 12, // px to em
	// 				style: {
	// 					alignment: {
	// 						horizontal: hAlignment,
	// 						wrapText: true,
	// 					},
	// 				},
	// 			} as Excel.Column;
	// 		}
	// 	);

	// 	_.forEach(
	// 		this.selectedRows,
	// 		( { data }: Row ) => {
	// 			const obj: Record<Column[ 'id' ], string>
	// 				= {};

	// 			_.forEach(
	// 				this.displayingColumns,
	// 				( { id, field }: Column ) => {
	// 					obj[ id ]
	// 						= field
	// 						.toString( data[ id ] );
	// 				}
	// 			);

	// 			worksheet.addRow( obj );
	// 		}
	// 	);

	// 	workbook[ extension ]
	// 	.writeBuffer()
	// 	.then(( buffer: Excel.Buffer ) => {
	// 		saveAs(
	// 			new Blob([ buffer ]),
	// 			`export.${extension}`
	// 		);
	// 	});
	// }

	/**
	 * @return {void}
	 */
	public print() {}

	/**
	 * @param {Row[]} _rows
	 * @param {Action} _action
	 * @return {void}
	 */
	protected triggerAction(
		_rows: Row[],
		_action: Action
	) {}

	/**
	 * @param {Row[]} selectedRows
	 * @return {void}
	 */
	public exportXlsx(
		selectedRows: Row[]
	) {
		this.export.emit({
			rows: selectedRows,
			columns: this.displayingColumns,
		});
	}
}
