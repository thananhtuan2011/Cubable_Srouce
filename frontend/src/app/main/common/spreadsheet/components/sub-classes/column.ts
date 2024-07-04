import {
	ElementRef,
	EventEmitter,
	inject
} from '@angular/core';
import {
	CdkDragDrop,
	CdkDragEnd,
	CdkDragMove,
	CdkDragStart,
	moveItemInArray,
	Point
} from '@angular/cdk/drag-drop';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ResizeEvent
} from 'angular-resizable-element';
import {
	isObservable,
	Observable,
	Observer,
	of
} from 'rxjs';
import {
	ulid,
	ULID
} from 'ulidx';
import moment
	from 'moment-timezone';
import _ from 'lodash';

import {
	generateUniqueName,
	Throttle,
	untilCmpDestroyed
} from '@core';

import {
	createCUBDate
} from '@cub/material/date-picker';
import {
	CUBMenuConfig,
	CUBMenuRef,
	CUBMenuComponent
} from '@cub/material/menu';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	FieldBuilderService
} from '@main/common/field/modules/builder/services';
import {
	FieldMenuService
} from '@main/common/field/services';
import {
	DataType,
	DropdownData,
	DropdownOption,
	FormulaData,
	LinkData,
	ParagraphData,
	PhoneData
} from '@main/common/field/interfaces';
import {
	AttachmentField,
	CheckboxField,
	CreatedByField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	Field,
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LinkField,
	LookupField,
	NumberField,
	ParagraphField,
	PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	ReferenceField,
	TextField
} from '@main/common/field/objects';
import {
	FIELD_METADATA
} from '@main/common/field/resources';

import {
	SortingPredicateReturnType,
	SortingType
} from '../../helpers/sort';
import {
	GroupingType
} from '../../helpers/group';
import {
	CalculatingType
} from '../../helpers/calculate';
import {
	CALCULATIONS_TYPE
} from '../../resources';

import {
	BaseClass,
	Dimension
} from './base';
import type {
	Config,
	LayoutProperties
} from './main';
import type {
	Row
} from './row';

export type Column = {
	id: ULID;
	field: Field;

	width?: number;

	editable?: boolean;
	deletable?: boolean;

	hidden?: boolean;
	highlight?: boolean;
	warning?: boolean | string;
	groupingType?: GroupingType;
	sortingType?: SortingType;
	calculatingType?: CalculatingType;
};

export type ColumnDuplicatedEvent = {
	column: Column;
	sourceColumn: Column;
	position: number;
	isDuplicateValue?: boolean;
};

export type ColumnInsertedEvent = {
	column: Column;
	position: number;
};

export type ColumnMovedEvent = {
	column: Column;
	position: number;
};

type PanelColumn = {
	index: number;
	column: Column;
};

interface ColumnExtra extends Column {
	_bkWidth?: number;
	_isDragging?: boolean;
	_isResizing?: boolean;
}

const EMPTY_GROUP_VALUE: any = Infinity;
const UNGROUPABLE_FIELD_DATA_TYPES: ReadonlySet<DataType>
	= new Set([
		ParagraphField.dataType,
		AttachmentField.dataType,
		LookupField.dataType,
	]);
const UNSORTABLE_FIELD_DATA_TYPES: ReadonlySet<DataType>
	= new Set([
		AttachmentField.dataType,
	]);
const parseDateString: ( value: string ) => string
	= ( value: string ): string => {
		return value
			? moment( value )
			.startOf( 'd' )
			.toISOString()
			: EMPTY_GROUP_VALUE;
	};
const parseGroupValue: ( value: any ) => any
	= ( value: any ): any => {
		return !_.isNaN( value )
			&& !_.isError( value )
			&& !_.isStrictEmpty( value )
			? value
			: EMPTY_GROUP_VALUE;
	};

function calculateColumnDragPlaceholderIndex(
	offsetX: number,
	scrollLeft: number,
	frozenIndex: number,
	offsets: number[]
): number {
	let dragPlaceholderIndex: number
		= 0;

	for (
		let i: number = 0;
		i < offsets.length;
		i++
	) {
		let a: number
			= offsets[ i ];
		let b: number
			= offsets[ i + 1 ] || a;

		if ( i <= frozenIndex ) {
			a += scrollLeft;
			b += scrollLeft;
		}

		if ( offsetX < a ) {
			break;
		}

		if ( offsetX >= a
			&& offsetX <= b ) {
			dragPlaceholderIndex = i;
			break;
		}

		dragPlaceholderIndex = i;
	}

	return dragPlaceholderIndex;
}

function calculateFrozenDividerDragPlaceholderIndex(
	offsetX: number,
	scrollLeft: number,
	frozenIndex: number,
	offsets: number[]
): number {
	let dragPlaceholderIndex: number
		= 0;

	for (
		let i: number = 0;
		i < offsets.length;
		i++
	) {
		let a: number
			= offsets[ i ];
		let b: number
			= offsets[ i + 1 ] || a;

		if ( i <= frozenIndex ) {
			a += scrollLeft;
			b += scrollLeft;
		}

		if ( offsetX < a ) {
			break;
		}

		if ( offsetX >= a
			&& offsetX <= b ) {
			const compared: number
				= ( a + b ) / 2;

			if ( offsetX < compared ) {
				dragPlaceholderIndex = i;
			} else if ( offsetX >= compared ) {
				dragPlaceholderIndex = i + 1;
			}

			break;
		}

		dragPlaceholderIndex = i;
	}

	return dragPlaceholderIndex;
}

export class ColumnClass extends BaseClass {

	public columns: Column[];

	public columnsChange: EventEmitter<Column[]>;
	public columnAdded: EventEmitter<Column>;
	public columnCalculated: EventEmitter<Column>;
	public columnDeleted: EventEmitter<Column[]>;
	public columnDuplicated: EventEmitter<ColumnDuplicatedEvent>;
	public columnFieldEdited: EventEmitter<Column>;
	public columnFreezed: EventEmitter<number>;
	public columnGrouped: EventEmitter<Column>;
	public columnHidden: EventEmitter<Column[]>;
	public columnInserted: EventEmitter<ColumnInsertedEvent>;
	public columnMoved: EventEmitter<ColumnMovedEvent>;
	public columnResized: EventEmitter<Column>;
	public columnSelected: EventEmitter<Column[] | null>;
	public columnSorted: EventEmitter<Column>;
	public columnUncalculated: EventEmitter<Column>;
	public columnUngrouped: EventEmitter<Column>;
	public columnUnhidden: EventEmitter<Column>;
	public columnUnsorted: EventEmitter<Column>;

	protected readonly fieldBuilder: FieldBuilderService;
	protected readonly fieldMenuService: FieldMenuService;
	protected readonly columnActionMenu: CUBMenuComponent;
	protected readonly CALCULATIONS_TYPE:
		typeof CALCULATIONS_TYPE
		= CALCULATIONS_TYPE;
	protected readonly UNSORTABLE_FIELD_DATA_TYPES:
		typeof UNSORTABLE_FIELD_DATA_TYPES
		= UNSORTABLE_FIELD_DATA_TYPES;
	protected readonly UNGROUPABLE_FIELD_DATA_TYPES:
		typeof UNGROUPABLE_FIELD_DATA_TYPES
		= UNGROUPABLE_FIELD_DATA_TYPES;
	protected readonly MAX_FREEZE_VIEWPORT_RATIO: number = .65;
	protected readonly DATA_TYPE: typeof DataType = DataType;

	protected primaryColumn: Column;
	protected leftPaneColumns: PanelColumn[];
	protected rightPaneColumns: PanelColumn[];
	protected calculatingColumns: Map<Column[ 'id' ], Column>;
	protected groupingColumns: Map<Column[ 'id' ], Column>;
	protected sortingColumns: Map<Column[ 'id' ], Column>;
	protected cachedOptions: Map<ULID, DropdownOption[]>;
	protected fieldMenuRef: CUBMenuRef;

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	private _displayingColumns: Column[];
	private _field$: Observable<Field[]>;

	get frozenIndex(): number {
		let frozenIndex: number
			= this
			.config
			.column
			.frozenIndex;

		if (
			this.displayingColumns
				&& frozenIndex
					> this
					.displayingColumns
					.length - 1
		) {
			frozenIndex
				= this
				.displayingColumns
				.length - 1;
		}

		return frozenIndex;
	}

	get displayingColumns(): Column[] {
		return this._displayingColumns;
	}
	set displayingColumns( columns: Column[] ) {
		this._displayingColumns = columns;

		if ( this.frozenIndex === null ) {
			this.leftPaneColumns = [];
			this.rightPaneColumns
				= this._createPanelColumns( columns );

			return;
		}

		this.leftPaneColumns
			= this._createPanelColumns(
				columns,
				0,
				this.frozenIndex + 1
			);

		this.rightPaneColumns
			= this._createPanelColumns(
				columns,
				this.frozenIndex + 1
			);
	}

	get fields$(): Observable<Field[]> {
		return this._field$ ||= new Observable(
			( ob: Observer<Field[]> ) => {
				ob.next(
					_.map(
						this.columns,
						'field'
					)
				);
			}
		);
	}

	get canHideSelectedColumns(): boolean {
		return !_.find(
			this.getSelectedColumns(),
			( column: Column ) => {
				return column
				.field
				.isPrimary;
			}
		);
	}

	get canDeleteSelectedColumns(): boolean {
		return !_.find(
			this.getSelectedColumns(),
			( column: Column ) => {
				return column.field.isPrimary
					|| !column.deletable;
			}
		);
	}

	get hasSelectingColumn(): boolean {
		return !!this
		.layoutProperties
		.column
		.selection
		?.first;
	}

	/**
	 * @param {Column[]} columns
	 * @return {void}
	 */
	public pushColumns( columns: Column[] ) {
		const columnLookup:
			Record<Column[ 'id' ], Column>
			= _.keyBy(
				this.columns,
				'id'
			);
		const newColumns: Column[]
			= _.filter(
				columns,
				( column: Column ): boolean =>
					!columnLookup[ column.id ]
			);

		if ( !newColumns.length ) {
			return;
		}

		if ( !this.columns ) {
			this
			.columnsChange
			.emit( this.columns = [] );
		}

		this.columns.push(
			...newColumns
		);

		this.updateColumns( columns );
	}

	/**
	 * @param {Column[]} columns
	 * @return {void}
	 */
	public updateColumns( columns: Column[] ) {
		const displayingColumns: Set<Column>
			= new Set( this.displayingColumns );
		let hasNewDisplayingColumns: boolean;

		this.calculatingColumns ||= new Map();
		this.groupingColumns ||= new Map();
		this.sortingColumns ||= new Map();

		_.forEach(
			columns,
			( column: Column ) => {
				column.id ||= ulid();

				_.defaultsDeep(
					column,
					this
					.config
					.column
					.default
				);

				hasNewDisplayingColumns
					||= !column.hidden
						&& !displayingColumns.has( column );

				if ( column.field.isPrimary ) {
					this.primaryColumn = column;
				}

				if ( column.calculatingType ) {
					this.calculatingColumns.set(
						column.id,
						column
					);
				}

				if ( column.groupingType ) {
					this.groupingColumns.set(
						column.id,
						column
					);
				}

				if ( column.sortingType ) {
					this.sortingColumns.set(
						column.id,
						column
					);
				}
			}
		);

		if ( hasNewDisplayingColumns ) {
			this.markAsDisplayingColumnsChanged(
				_.filter(
					this.columns,
					( c: Column ) => !c.hidden
				)
			);
		}
	}

	/**
	 * @param {Column=} includeColumn
	 * @return {Column[]}
	 */
	public getGroupableColumns(
		includeColumn?: Column
	): Column[] {
		return _.filter(
			this.columns,
			( column: Column ): boolean => {
				return !UNGROUPABLE_FIELD_DATA_TYPES
				.has( column.field.dataType )
				&& ( includeColumn === column
					|| !this.groupingColumns
					.has( column.id ) );
			}
		);
	}

	/**
	 * @param {Column=} includeColumn
	 * @return {Column[]}
	 */
	public getSortableColumns(
		includeColumn?: Column
	): Column[] {
		return _.filter(
			this.columns,
			( column: Column ): boolean => {
				return !UNSORTABLE_FIELD_DATA_TYPES
				.has
				(
					column.field.dataType
				)
					&& !UNSORTABLE_FIELD_DATA_TYPES
					.has
					(
						( column.field as LookupField )?.
						lookup?.
						targetDataType
					)
					&& !UNSORTABLE_FIELD_DATA_TYPES
					.has
					(
						( column.field as LookupField )?.
						lookup?.
						targetFieldParams?.
						lookup?.
						targetDataType
					)
				&& ( includeColumn === column
					|| !this.sortingColumns
					.has( column.id ) );
			}
		);
	}

	/**
	 * @param {Column} column
	 * @param {number} width
	 * @return {void}
	 */
	public setColumnWidth(
		column: Column,
		width: number
	) {
		if ( !column ) return;

		column.width = width;

		this.updateColumnOffsets();
	}

	/**
	 * @param {Column} column
	 * @param {number} newIndex
	 * @return {void}
	 */
	public moveColumn(
		column: Column,
		newIndex: number
	) {
		const currentIndex: number
			= _.indexOf(
				this.columns,
				column
			);

		moveItemInArray(
			this.columns,
			currentIndex,
			newIndex
		);

		if ( column.hidden ) {
			return;
		}

		this.markAsDisplayingColumnsChanged(
			_.filter(
				this.columns,
				( c: Column ) => !c.hidden
			)
		);
	}

	/**
	 * @param {Column} column
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public hideColumn(
		column: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| column.field.isPrimary ) {
			return;
		}

		column.hidden = true;

		this.markAsDisplayingColumnsChanged(
			_.without(
				this.displayingColumns,
				column
			)
		);

		this.markForCheck();

		this.virtualScroll.markForCheck();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnHidden
		.emit([ column ]);
	}

	/**
	 * @param {Column} column
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public unhideColumn(
		column: Column,
		isEmitOutput?: boolean
	) {
		if ( !column ) return;

		column.hidden = false;

		this.markAsDisplayingColumnsChanged(
			_.filter(
				this.columns,
				( c: Column ) => !c.hidden
			)
		);

		this.markForCheck();

		this.virtualScroll.markForCheck();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnUnhidden
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {CalculatingType=} calculatingType
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public calculateByColumn(
		column: Column,
		calculatingType: CalculatingType = column.calculatingType,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !calculatingType ) {
			return;
		}
		column.calculatingType
			= calculatingType;

		this.calculatingColumns.set(
			column.id,
			column
		);

		this.calculate([ column ]);

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnCalculated
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public uncalculateByColumn(
		column: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !this.calculatingColumns
			.has( column.id ) ) {
			return;
		}

		delete column.calculatingType;

		this.calculatingColumns.delete(
			column.id
		);

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnUncalculated
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {GroupingType=} groupingType
	 * @param {Column=} replaceColumn
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public groupByColumn(
		column: Column,
		groupingType: GroupingType = 'asc',
		replaceColumn?: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !groupingType
			|| column.groupingType
				=== groupingType ) {
			return;
		}

		column.groupingType = groupingType;

		if ( replaceColumn ) {
			delete replaceColumn.groupingType;

			const groupingColumns:
				Map<Column[ 'id' ], Column>
				= new Map();

			for (
				const [ key, value ]
				of this.groupingColumns
			) {
				if ( key === replaceColumn.id ) {
					groupingColumns.set(
						column.id,
						column
					);
					continue;
				}

				groupingColumns.set( key, value );
			}

			this.groupingColumns = groupingColumns;
		} else {
			this.groupingColumns.set(
				column.id,
				column
			);
		}

		this.group();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnGrouped
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public ungroupByColumn(
		column: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !this.groupingColumns
			.has( column.id ) ) {
			return;
		}

		delete column.groupingType;

		this.groupingColumns.delete(
			column.id
		);

		this.groupingColumns.size
			? this.group()
			: this.ungroup();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnUngrouped
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {SortingType=} sortingType
	 * @param {Column=} replaceColumn
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public sortByColumn(
		column: Column,
		sortingType: SortingType = 'asc',
		replaceColumn?: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !sortingType
			|| column.sortingType === sortingType ) {
			return;
		}

		column.sortingType = sortingType;

		if ( replaceColumn ) {
			delete replaceColumn.sortingType;

			const sortingColumns:
				Map<Column[ 'id' ], Column>
				= new Map();

			for (
				const [ key, value ]
				of this.sortingColumns
			) {
				if ( key === replaceColumn.id ) {
					sortingColumns.set(
						column.id,
						column
					);
					continue;
				}

				sortingColumns.set( key, value );
			}

			this.sortingColumns = sortingColumns;
		} else {
			this.sortingColumns.set(
				column.id,
				column
			);
		}

		this.cachedOptions ||= new Map();

		this.sort();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnSorted
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {boolean=} isEmitOutput
	 * @return {void}
	 */
	public unsortByColumn(
		column: Column,
		isEmitOutput?: boolean
	) {
		if ( !column
			|| !this.sortingColumns
			.has( column.id ) ) {
			return;
		}

		delete column.sortingType;

		this.sortingColumns.delete(
			column.id
		);

		this.sortingColumns.size
			? this.sort()
			: this.unsort();

		if ( !isEmitOutput ) {
			return;
		}

		this
		.columnUnsorted
		.emit( column );
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected onFrozenDividerMouseMove(
		e: MouseEvent
	) {
		this
		.layoutProperties
		.frozenDivider
		.dragHandleOffset
			= e.offsetY
				- ( Dimension.FrozenDividerDragHandleHeight
					/ 2 );
	}

	/**
	 * @param {CdkDragStart} _e
	 * @return {void}
	 */
	protected onFrozenDividerDragStarted(
		_e: CdkDragStart
	) {
		this
		.virtualScroll
		.scrollBar
		.scrollToLeft();
	}

	/**
	 * @param {CdkDragEnd} e
	 * @return {void}
	 */
	protected onFrozenDividerDragEnded(
		e: CdkDragEnd
	) {
		const newFrozenIndex: number
			= this
			.layoutProperties
			.frozenDivider
			.dragPlaceholderIndex - 1;

		this.freezeUpToColumnIndex(
			newFrozenIndex
		);

		this
		.layoutProperties
		.frozenDivider
		.dragPlaceholderIndex = -1;
		this
		.layoutProperties
		.frozenDivider
		.dragPlaceholderOffset = null;

		e.source._dragRef.reset();
	}

	/**
	 * @param {CdkDragMove} e
	 * @return {void}
	 */
	protected onFrozenDividerDragMoved(
		e: CdkDragMove
	) {
		const {
			x: pointerOffsetX,
		}: Point = this
		.virtualScroll
		.measurePointerOffset(
			e.pointerPosition
		);
		const index: number
			= calculateFrozenDividerDragPlaceholderIndex(
				pointerOffsetX,
				this
				.virtualScroll
				.scrollBar
				.scrollLeft,
				this.frozenIndex,
				this.layoutProperties
				.column
				.offsets
			);
		const offset: number
			= this
			.layoutProperties
			.column
			.offsets[ index ];

		if ( ( offset
				/ this.virtualScroll.viewportWidth )
				> this.MAX_FREEZE_VIEWPORT_RATIO ) {
			return;
		}

		this
		.layoutProperties
		.frozenDivider
		.dragPlaceholderIndex = index;

		this
		.layoutProperties
		.frozenDivider
		.dragPlaceholderOffset = offset;
	}

	/**
	 * @param {CdkDragStart} _e
	 * @param {ColumnExtra} column
	 * @return {void}
	 */
	protected onColumnDragStarted(
		_e: CdkDragStart,
		column: ColumnExtra
	) {
		this.deselectAllColumns();
		this.deselectAllCells();

		column._isDragging = true;
	}

	/**
	 * @param {CdkDragEnd} _e
	 * @param {ColumnExtra} column
	 * @return {void}
	 */
	protected onColumnDragEnded(
		_e: CdkDragEnd,
		column: ColumnExtra
	) {
		column._isDragging = false;
	}

	/**
	 * @param {CdkDragMove} e
	 * @return {void}
	 */
	protected onColumnDragMoved(
		e: CdkDragMove
	) {
		const {
			x: pointerOffsetX,
		}: Point = this
		.virtualScroll
		.measurePointerOffset(
			e.pointerPosition
		);
		const index: number
			= calculateColumnDragPlaceholderIndex(
				pointerOffsetX
					+ e
					.source
					.element
					.nativeElement
					.clientWidth,
				this
				.virtualScroll
				.scrollBar
				.scrollLeft,
				this.frozenIndex,
				this
				.layoutProperties
				.column
				.offsets
			);

		if (
			this
			.displayingColumns[ index ]
			?.field
			.isPrimary
		) {
			return;
		}

		const offset: number
			= this
			.layoutProperties
			.column
			.offsets[ index ] - (
				index - 1 > this.frozenIndex
					? this
					.virtualScroll
					.scrollBar
					.scrollLeft
					: 0
			);

		this
		.layoutProperties
		.column
		.dragPlaceholderIndex = index;

		this
		.layoutProperties
		.column
		.dragPlaceholderOffset = offset;
	}

	/**
	 * @param {CdkDragDrop<Column[]>} e
	 * @return {void}
	 */
	protected onColumnDropped(
		e: CdkDragDrop<Column[]>
	) {
		const {
			dragPlaceholderIndex,
		}: LayoutProperties[ 'column' ]
			= this
			.layoutProperties
			.column;
		const previousIndex: number
			= e.previousIndex;
		const currentIndex: number
			= dragPlaceholderIndex > previousIndex
				? dragPlaceholderIndex - 1
				: dragPlaceholderIndex;

		this
		.layoutProperties
		.column
		.dragPlaceholderIndex = -1;

		this
		.layoutProperties
		.column
		.dragPlaceholderOffset = null;

		if ( previousIndex
				=== currentIndex ) {
			return;
		}

		moveItemInArray(
			this.displayingColumns,
			previousIndex,
			currentIndex
		);

		const previousColumn: Column
			= this.displayingColumns[ currentIndex - 1 ];
		const column: Column
			= this.displayingColumns[ currentIndex ];
		const cIdx: number
			= _.indexOf( this.columns, column );
		const nIdx: number
			= _.indexOf( this.columns, previousColumn ) + 1;

		moveItemInArray(
			this.columns,
			cIdx,
			nIdx
		);

		this.markAsDisplayingColumnsChanged();

		this
		.columnMoved
		.emit({
			column,
			position: currentIndex,
		});
	}

	/**
	 * @param {ResizeEvent} event
	 * @param {ColumnExtra} column
	 * @param {number} _idx
	 * @return {void}
	 */
	protected onColumnResizing(
		event: ResizeEvent,
		column: ColumnExtra,
		_idx: number
	) {
		const minResizeWidth: number
			= this
			.config
			.column
			.minResizeWidth;
		let newWidth: number
			= event.rectangle.width;

		if ( newWidth < minResizeWidth ) {
			newWidth = minResizeWidth;
		}

		if ( !column._bkWidth ) {
			column._bkWidth
				= column.width;
		}

		column.width = newWidth;
		column._isResizing = true;

		this.updateColumnOffsets();

		this.virtualScroll.markForCheck();
	}

	/**
	 * @param {ResizeEvent} event
	 * @param {ColumnExtra} column
	 * @return {void}
	 */
	protected onColumnResized(
		event: ResizeEvent,
		column: ColumnExtra
	) {
		const minResizeWidth: number
			= this
			.config
			.column
			.minResizeWidth;
		let newWidth: number
			= event.rectangle.width;

		if ( newWidth < minResizeWidth ) {
			newWidth = minResizeWidth;
		}

		column._bkWidth = undefined;
		column._isResizing = false;

		this.virtualScroll.markForCheck();

		this
		.columnResized
		.emit( column );
	}

	/**
	 * @param {Column} column
	 * @param {Field} field
	 * @return {void}
	 */
	protected onFieldEdited(
		column: Column,
		field: Field
	) {
		field.params
			= field
			.toJson()
			?.params;

		column.field = field;

		this
		.columnFieldEdited
		.emit( column );
	}

	/**
	 * @param {ElementRef | HTMLElement} element
	 * @param {CUBMenuConfig[ 'position' ]=} position
	 * @param {number=} columnIndex
	 * @return {void}
	 */
	protected openColumnFieldMenu(
		element: ElementRef | HTMLElement,
		position?: CUBMenuConfig[ 'position' ],
		columnIndex?: number
	) {
		this.fieldMenuRef?.close();

		this.fieldMenuRef
			= this.fieldMenuService.open(
				element,
				{
					otherFields: this.fields$,
					context: this.context,
					onDone: ( field: Field ) => {
						this
						.columnActionMenu
						.close?.();

						this.createColumn(
							field,
							columnIndex
						);
					},
					config: { position },
				},
				{ position }
			);
	}

	/**
	 * @param {Column} column
	 * @param {ElementRef} headerCell
	 * @return {void}
	 */
	protected editColumnFieldProperties(
		column: Column,
		headerCell: ElementRef
	) {
		this.deselectAllColumns();
		this.deselectAllCells();

		this.columnActionMenu.close?.();

		this.fieldBuilder.build(
			column.field,
			headerCell,
			this.fields$,
			this.context,
			this
			.onFieldEdited
			.bind( this, column )
		);
	}

	/**
	 * @param {number} columnIndex
	 * @return {void}
	 */
	protected freezeUpToColumnIndex(
		columnIndex: number
	) {
		if ( columnIndex === this.frozenIndex ) {
			return;
		}

		this
		.config
		.column
		.frozenIndex = columnIndex;

		this.markAsDisplayingColumnsChanged();

		this
		.columnFreezed
		.emit( columnIndex );
	}

	/**
	 * @param {Field} field
	 * @param {number=} position
	 * @return {Column}
	 */
	protected createColumn(
		field: Field,
		position?: number
	): Column {
		const newColumn: Column
			= this._generateColumn();

		newColumn.field
			= field;
		newColumn.field.id
			= newColumn.id;

		this._insertColumn(
			newColumn,
			position
		);

		if ( _.isFinite( position ) ) {
			this
			.columnInserted
			.emit({
				column: newColumn,
				position,
			});
		} else {
			this
			.columnAdded
			.emit( newColumn );

			setTimeout( () => {
				this
				.virtualScroll
				.scrollBar
				.scrollToRight( 225 );
			}, 225 );
		}

		return newColumn;
	}

	/**
	 * @param {Column} sourceColumn
	 * @param {boolean=} isDuplicateValue
	 * @return {Column}
	 */
	protected duplicateColumn(
		sourceColumn: Column,
		isDuplicateValue?: boolean
	): Column {
		const newColumn: Column
			= this._generateColumn(
				sourceColumn
			);
		const position: number
			= _.indexOf(
				this.displayingColumns,
				sourceColumn
			) + 1;

		newColumn.field.id
			= newColumn.id;
		newColumn.field.isPrimary
			= false;
		newColumn.field.name
			= this.generateUniqueColumnName(
				this._translateService.instant(
					FIELD_METADATA.get(
						sourceColumn.field.dataType
					).label
				)
			);

		this._insertColumn(
			newColumn,
			position
		);

		this
		.columnDuplicated
		.emit({
			column: newColumn,
			sourceColumn,
			position,
			isDuplicateValue,
		});

		this.columnActionMenu.close();

		return newColumn;
	}

	/**
	 * @param {MouseEvent} e
	 * @param {number} columnIndex
	 * @return {void}
	 */
	protected selectColumn(
		e: MouseEvent,
		columnIndex: number
	) {
		this.deselectAllRows();

		const map: Map<number, Column>
			= this
			.layoutProperties
			.column
			.selection
			?.map || new Map();

		if ( e.shiftKey ) {
			const [
				first,
			]: IterableIterator<number>
				= map.keys();
			let startIndex: number
				= first ?? columnIndex;
			let endIndex: number
				= columnIndex;

			if ( columnIndex < startIndex ) {
				endIndex = startIndex;
				startIndex = columnIndex;
			} else {
				endIndex = columnIndex;
			}

			for (
				let i: number = startIndex;
				i <= endIndex;
				i++
			) {
				const column: Column
					= this.displayingColumns[ i ];

				map.set(
					i,
					column
				);
			}
		} else if ( e.ctrlKey || e.metaKey ) {
			const column: Column
				= this.displayingColumns[ columnIndex ];

			map.set(
				columnIndex,
				column
			);
		} else {
			const column: Column
				= this.displayingColumns[ columnIndex ];

			map.clear();

			map.set(
				columnIndex,
				column
			);

			this.selectCell(
				0,
				columnIndex
			);
		}

		this
		.layoutProperties
		.column
		.selection = {
			first: map
			.entries()
			.next()
			.value[ 1 ],
			map,
		};

		this.columnSelected.emit(
			_.filter(
				this.displayingColumns,
				(
					_c: Column,
					i: number
				): boolean => {
					return map.has( i );
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	protected deselectAllColumns() {
		if ( !this.hasSelectingColumn ) {
			return;
		}

		this
		.layoutProperties
		.column
		.selection = null;

		this
		.columnSelected
		.emit( null );
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected deleteColumn(
		column: Column
	) {
		const {
			deleteConfirmation,
		}: Config[ 'column' ]
			= this.config.column;
		let ob: Observable<boolean>
			= of( true );

		if ( deleteConfirmation === true ) {
			ob = this.confirmService
			.open(
				'SPREADSHEET.MESSAGE.DELETE_COLUMN_CONFIRMATION',
				'SPREADSHEET.MESSAGE.DELETE_COLUMN_TITLE',
				{
					warning: true,
					buttonApply: {
						text: 'SPREADSHEET.LABEL.DELETE',
						type: 'destructive',
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
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe((
			answer: boolean
		) => {
			if ( !answer ) {
				return;
			}

			_.remove(
				this.columns,
				column
			);

			this.markAsDisplayingColumnsChanged(
				_.without(
					this.displayingColumns,
					column
				)
			);

			this.deselectAllColumns();
			this.deselectAllCells();

			this.columnActionMenu.close();

			this
			.columnDeleted
			.emit([ column ]);
		});
	}

	/**
	 * @return {void}
	 */
	protected deleteSelectedColumns() {
		const {
			deleteConfirmation,
		}: Config[ 'column' ]
			= this.config.column;
		let ob: Observable<boolean>
			= of( true );

		if ( deleteConfirmation === true ) {
			ob = this
			.confirmService
			.open(
				'SPREADSHEET.MESSAGE.DELETE_SELECTED_COLUMN_CONFIRMATION',
				'SPREADSHEET.MESSAGE.DELETE_SELECTED_COLUMN_TITLE',
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
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe((
			answer: boolean
		) => {
			if ( !answer ) {
				return;
			}

			const columns: Column[]
				= this.getSelectedColumns();

			_.pull(
				this.columns,
				...columns
			);

			this.markAsDisplayingColumnsChanged(
				_.without(
					this.displayingColumns,
					...columns
				)
			);

			this.deselectAllColumns();
			this.deselectAllCells();

			this.columnActionMenu.close();

			this.markForCheck();

			this.virtualScroll.markForCheck();

			this.columnDeleted.emit(
				columns
			);
		});
	}

	/**
	 * @return {void}
	 */
	protected hideSelectedColumns() {
		const columns: Column[]
			= this.getSelectedColumns();

		this.markAsDisplayingColumnsChanged(
			_.without(
				this.displayingColumns,
				...columns
			)
		);

		this.markForCheck();

		this.virtualScroll.markForCheck();

		this
		.columnHidden
		.emit( columns );
	}

	/**
	 * @param {string} name
	 * @return {string}
	 */
	protected generateUniqueColumnName(
		name: string
	): string {
		return generateUniqueName(
			_.map(
				this.columns,
				(
					{ field }: Column
				): string => {
					return field.name;
				}
			),
			name,
			80
		);
	}

	/**
	 * @return {number}
	 */
	protected getLastColumnIndex(): number {
		return this
		.displayingColumns
		.length - 1;
	}

	/**
	 * @return {Column[]}
	 */
	protected getSelectedColumns(): Column[] {
		const { map }:
			LayoutProperties[ 'column' ][ 'selection' ]
			= this
			.layoutProperties
			.column
			.selection;

		return [ ...map.values() ];
	}

	/**
	 * @param {Column[ 'id' ]} columnID
	 * @return {number}
	 */
	protected findColumnIndexByID(
		columnID: Column[ 'id' ]
	): number {
		return _.findIndex(
			this.displayingColumns,
			{ id: columnID }
		);
	}

	/**
	 * @param {Column[]=} columns
	 * @return {void}
	 */
	protected markAsDisplayingColumnsChanged(
		columns: Column[] = this.displayingColumns
	) {
		this.displayingColumns
			= [ ...columns ];

		this.updateColumnOffsets();
	}

	/**
	 * @return {void}
	 */
	@Throttle( 17 ) // 60fps
	protected updateColumnOffsets() {
		const offsets: number[] = [];
		const indexCellWidth: number
			= this.isPickerMode ? 40 : 64;
		let offset: number
			= indexCellWidth;

		if ( this.isGrouping ) {
			offset += ( this.groupDepth - 1 )
				* Dimension.GroupPadding
				+ ( this.groupDepth
					* Dimension.BoxBorderWidth );
		}

		for ( const column
			of this.displayingColumns ) {
			offsets.push( offset );

			offset += column.width;
		}

		offsets.push( offset );

		const length: number
			= this.displayingColumns.length;
		const leftWidth: number
			= length && this.frozenIndex !== null
				? offsets[ this.frozenIndex + 1 ]
				: indexCellWidth;
		let rightWidth: number
			= length
				? ( offsets[ length ] || 0 )
					- leftWidth
				: 0;

		if (
			this.isEditorMode
				&& this
				.config
				.column
				.creatable
		) {
			rightWidth += Dimension.ActionCellWidth;
		}

		rightWidth += Dimension.BoxBorderWidth;

		this
		.layoutProperties
		.column
		.offsets = offsets;

		this
		.layoutProperties
		.pane
		.leftWidth = leftWidth;

		this
		.layoutProperties
		.pane
		.rightWidth = rightWidth;
	}

	/**
	 * @param {Column[]} groupingColumns
	 * @param {Row} row
	 * @param {number} depth
	 * @return {any}
	 */
	protected groupColumnPredicate(
		groupingColumns: Column[],
		row: Row,
		depth: number
	): any {
		const idx: number
			= groupingColumns.length - depth;
		const column: Column
			= groupingColumns[ idx ];

		// if ( !column || !FieldHelper.isGroupableField( column.field ) ) return;
		if ( !column ) return;

		return this._parseGroupValue(
			row,
			column
		);
	}

	/**
	 * @param {Column[]} sortingColumns
	 * @param {number} sortingColumnIndex
	 * @param {Row} row
	 * @return {SortingPredicateReturnType}
	 */
	protected sortColumnPredicate(
		sortingColumns: Column[],
		sortingColumnIndex: number,
		row: Row
	): SortingPredicateReturnType {
		const column: Column
			= sortingColumns[ sortingColumnIndex ];

		if ( !column ) return;

		return [
			this._parseSortValue(
				row,
				column
			),
			column.sortingType
				=== 'desc',
		];
	}

	/**
	 * @param {Column} column
	 * @param {Row} row
	 * @param {CalculatingType} calculatingType
	 * @return {any}
	 */
	protected calculateColumnPredicate(
		column: Column,
		row: Row,
		calculatingType: CalculatingType
	) {
		let data: any
			= row.data?.[ column.id ];

		if ( _.isNil( data ) ) {
			data = null;
		} else {
			switch ( column.field.dataType ) {
				case CheckboxField.dataType:
					data ||= null;
					break;
				case CreatedTimeField.dataType:
				case DateField.dataType:
				case LastModifiedTimeField.dataType:
					switch ( calculatingType ) {
						case CalculatingType.DayRange:
							data = +createCUBDate( data )
							.startOf( 'day' );
							break;
						case CalculatingType.MonthRange:
							data = +createCUBDate( data )
							.startOf( 'month' );
							break;
						case CalculatingType.Unique:
						case CalculatingType.PercentUnique:
							data = column
							.field
							.toString( data );
							break;
					}
					break;
				case CreatedByField.dataType:
				case DropdownField.dataType:
				case LastModifiedByField.dataType:
				case PeopleField.dataType:
				case ReferenceField.dataType:
				case PhoneField.dataType:
					data = column
					.field
					.toString( data );
					break;
			}
		}

		return data;
	}

	/**
	 * @param {Partial<Column>=} extra
	 * @return {Column}
	 */
	private _generateColumn(
		extra?: Partial<Column>
	): Column {
		return _.cloneDeep({
			...this.config.column.default,
			...extra,
			id: ulid(),
		}) as Column;
	}

	/**
	 * @param {Column} column
	 * @param {number=} position
	 * @return {void}
	 */
	private _insertColumn(
		column: Column,
		position: number = this.displayingColumns.length
	) {
		const targetColumn: Column
			= this.displayingColumns[ position - 1 ];
		const targetIndex: number
			= _.indexOf(
				this.columns,
				targetColumn
			);

		this.columns.splice(
			targetIndex + 1,
			0,
			column
		);

		this.displayingColumns.splice(
			position,
			0,
			column
		);

		this.markAsDisplayingColumnsChanged();

		this.virtualScroll.markForCheck();
	}

	/**
	 * @param {Column[]} columns
	 * @param {number=} startIndex
	 * @param {number=} endIndex
	 * @return {PanelColumn[]}
	 */
	private _createPanelColumns(
		columns: Column[],
		startIndex: number = 0,
		endIndex?: number
	): PanelColumn[] {
		return _.map(
			columns.slice(
				startIndex,
				endIndex
			),
			(
				column: Column,
				idx: number
			): PanelColumn => ({
				index: idx + startIndex,
				column,
			})
		);
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @return {any}
	 */
	private _parseGroupValue(
		row: Row,
		column: Column
	): any {
		// let lookupTargetFieldDataType: DataType;
		// let isLookupTargetOnDateField: boolean = false;
		// let isLookupTargetOnUniqValue: boolean = false;

		// if ( FieldHelper.isLookupField( column.field ) ) {
		// 	lookupTargetFieldDataType = FieldHelper.getLookupTargetFieldDataType( column.field as LookupField );
		// 	isLookupTargetOnDateField = FieldHelper.isDateField( lookupTargetFieldDataType );
		// 	isLookupTargetOnUniqValue = FieldHelper.isDropdownField( lookupTargetFieldDataType )
		// 		|| FieldHelper.isPeopleField( lookupTargetFieldDataType )
		// 		|| FieldHelper.isReferenceField( lookupTargetFieldDataType )
		// 		|| FieldHelper.isDocumentField( lookupTargetFieldDataType )
		// 		|| FieldHelper.isLastModifiedByField( lookupTargetFieldDataType );
		// }

		let data: any
			= row.data?.[ column.id ];

		if ( data ) {
			switch ( column.field.dataType ) {
				case CheckboxField.dataType:
					data = !!data;
					break;
				case PhoneField.dataType:
					data = data.phone;
					break;
				case LinkField.dataType:
					data = data.text
						|| data.link;
					break;
				case DateField.dataType:
				case LastModifiedTimeField.dataType:
				case CreatedTimeField.dataType:
					data = parseDateString( data );
					break;
				case DropdownField.dataType:
				case PeopleField.dataType:
				case ReferenceField.dataType:
				case CreatedByField.dataType:
				case LastModifiedByField.dataType:
					data = data.value;
					break;
				case FormulaField.dataType:
					data = data.calculated.data;
					break;
				// case LookupField.dataType:
				// 	data = _.chain( fieldValue.params?.rawValue )
				// 	.map( ( v: any ): any => isLookupTargetOnDateField ? parseDateString( v ) : v )
				// 	.flatten()
				// 	.tap( ( v: any ) => isLookupTargetOnUniqValue ? _.uniq( v ) : v )
				// 	.sortBy()
				// 	.value();
				// 	break;
			}
		}

		return parseGroupValue( data );
	}

	/**
	 * @param {Row} row
	 * @param {Column} column
	 * @return {any}
	 */
	private _parseSortValue(
		row: Row,
		column: Column
	): any {
		let data: any
			= row.data?.[ column.id ];

		data ??= '';

		if ( data ) {
			switch ( column.field.dataType ) {
				case PhoneField.dataType:
					data = data.phone;
					break;
				case LinkField.dataType:
					data = data.text || data.link;
					break;
				case ParagraphField.dataType:
					data = data.text || data.link;
					break;
				case DropdownField.dataType:
					data = _.map(
						data.selected,
						( item: DropdownOption ) => {
							return _.findIndex(
								( column.field as DropdownField ).options,
								( option: DropdownOption ) =>
									option.name === item.name
							);
						}
					);

					break;
				case PeopleField.dataType:
				case CreatedByField.dataType:
				case LastModifiedByField.dataType:
					data = _.map(
						data.selected,
						( item: IUser ) => item.name
					);

					break;
				case ReferenceField.dataType:
				case FormulaField.dataType:
					data = data.calculated.data;
					break;
				case LookupField.dataType:
					data = this._parseLookupValue(
						data,
						column.field.extra.params.lookup.targetDataType,
						column.field as LookupField
					);
					break;
				// case MoneyField.dataType:
				// case NumberField.dataType:
				// case ProgressAutoField.dataType:
				// case ProgressManualField.dataType:
				// case RatingField.dataType:
				// 	sortValue = Number( key );
				// 	break;
				// case DocumentField.dataType:
				// case LastModifiedByField.dataType:
				// case PeopleField.dataType:
				// case ReferenceField.dataType:
				// case DateField.dataType:
				// 	data = Number( data?.date );
				// 	break;
			}
		}

		return data;
	}

	/**
	 * @param {any} data
	 * @param {DataType} targetDataType
	 * @param {LookupField} field
	 * @return {void}
	 */
	private _parseLookupValue(
		data: any,
		targetDataType: DataType,
		field: LookupField
	) {
		if(
			!_.isUndefined( data.calculated )
		) return data = data.calculated ?? '';

		if( data.selected ) {
			switch ( targetDataType ) {
				case TextField.dataType:
				case NumberField.dataType:
				case CurrencyField.dataType:
				case EmailField.dataType:
				case RatingField.dataType:
				case ProgressField.dataType:
				case CheckboxField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						(item: string | number ) => item
					);
					break;
				case DateField.dataType:
				case LastModifiedTimeField.dataType:
				case CreatedTimeField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						(item: string ) =>
							item.slice(0, 16)
					);

					break;
				case PhoneField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						(item: PhoneData) => item.phone
					);

					break;
				case LinkField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						(item: LinkData) => item.text ?? item.link
					);

					break;
				case ParagraphField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						( item: ParagraphData ) => item.text
					);

					break;
				case FormulaField.dataType:
					data = _.flatMap(
						_.compact( data.selected ),
						(item: FormulaData) => item.calculated.data
					);

					break;
				case DropdownField.dataType:
					const flattenedData: DropdownOption[]
						= _.chain( data.selected )
						.filter( (item: DropdownData) => !_.isEmpty( item ) )
						.flatMap( 'selected' )
						.filter(
							( option: DropdownOption ) => !_.isNil( option ) )
						.value();

					data = _.map(
						flattenedData,
						( item: DropdownOption ) => {
							return _.findIndex(
								field.lookup?.targetFieldParams?.options,
								( option: DropdownOption ) =>
									option.name === item.name
							);
						}
					);

					break;
				case PeopleField.dataType:
				case LastModifiedByField.dataType:
				case CreatedByField.dataType:
					data = _.chain(data.selected )
					.filter( (item: any) => item !== null )
					.flatMap( 'selected' )
					.map( 'name' )
					.value();

					break;
				case ReferenceField.dataType:
				case LookupField.dataType:
					if ( _.some(data.selected, 'calculated') ) {
						const calculatedValues: string[] | number[]
							= _.filter(
								data.selected,
								(item: any) => item.calculated !== undefined
							).map(
								(item: any) => item.calculated
							);

						data = {
							calculated: calculatedValues,
						};
					} else {
						const selectedValues: any = _.flatMap(
							data.selected, 'selected'
						).filter(
							(x: any) => x !== null
						);

						data = {
							selected: selectedValues,
						};
					}

					data = this._parseLookupValue(
						data,
						field
						.lookup
						.targetFieldParams
						.lookup
						.targetDataType,
						field
					);
					break;
			}
		} else {
			data = '';
		}

		return data;
	}
}
