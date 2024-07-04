// @ts-nocheck
import {
	ElementRef,
	QueryList
} from '@angular/core';
import {
	Point
} from '@angular/cdk/drag-drop';
import {
	Observable
} from 'rxjs';

import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastService
} from '@cub/material/toast';

import {
	Field
} from '@main/common/field/objects';

import {
	CalculatingType
} from '../../helpers/calculate';
import {
	SortingPredicateReturnType
} from '../../helpers/sort';

import {
	VirtualScrollComponent
} from '../sub-components/virtual-scroll/virtual-scroll.component';

import type {
	CellOffset
} from './cell';
import type {
	Column
} from './column';
import type {
	Group
} from './group';
import type {
	Config,
	LayoutProperties
} from './main';
import type {
	FoundRow,
	Row,
	RowCellData
} from './row';

export enum Dimension {
	ActionCellWidth = 56,
	BlankRowHeight = 32,
	BoxBorderWidth = 1,
	FooterHeight = 42,
	FrozenDividerDragHandleHeight = 40,
	GroupHeaderHeight = 32,
	GroupPadding = 20,
	GroupSpacing = 20,
	HeaderHeight = 36,
	PaneVerticalPadding = 12,
}

class CellBaseClass {

	get cellLine(): number;

	protected selectCell(
		rowIndex: number,
		columnIndex: number
	);

	protected deselectAllCells();

	protected updateCellsData(
		rows: Row[],
		newData: RowCellData
	);

}

class ColumnBaseClass extends CellBaseClass {

	public columns: Column[];

	protected groupingColumns: Map<Column[ 'id' ], Column>;

	get displayingColumns(): Column[];
	set displayingColumns( columns: Column[] );

	get fields$(): Observable<Field[]>;

	get hasSelectingColumn(): boolean;

	public calculateByColumn(
		column: Column,
		calculatingType: CalculatingType = column.calculatingType,
		isEmitOutput?: boolean
	);

	protected deselectAllColumns();

	protected getLastColumnIndex(): number;

	protected findColumnIndexByID( columnID: Column[ 'id' ] ): number;

	protected calculateColumnPredicate(
		column: Column,
		row: Row,
		calculatingType: CalculatingType
	);

	protected sortColumnPredicate(
		sortingColumns: Column[],
		sortingColumnIndex: number,
		row: Row
	): SortingPredicateReturnType;

}

class GroupBase extends ColumnBaseClass {

	get groupDepth(): number;

	get isGrouping(): boolean;

	protected calculateInGroup( columns?: Column[] );

	protected createRowInGroup(
		group: Group = this.getFocusingGroup() || this.getFirstGroup(),
		position?: number
	): Row;

	protected moveRowsInGroup(
		movedRows: Row[],
		movedIndex: number,
		targetGroup: Group
	);

	protected markRowsInGroupAsChanged(
		group: Group = this.rootGroup,
		items: Row[] = group.items
	);

	protected getLastRowIndexInGroup(): number;

	protected getRowCellOffsetInGroup(
		rowIndex: number,
		columnIndex: number
	): CellOffset;

	protected findRowInGroupAtPointerPosition(
		pointerPosition: Point
	): FoundRow;

	protected findRowIndexInGroupByID( rowID: Row[ 'id' ] ): number;

	protected updateGroupOffsets();

}

class RowBaseClass extends GroupBase {

	public rows: Row[];

	protected selectedRows: Row[];

	get rowHeight(): number;

	protected createRow( position?: number );

	protected duplicateRow( sourceRow: Row );

	protected deselectAllRows();

	protected markAsRowsChanged();

	protected getLastRowIndex(): number;

	protected findRowIndexByID( rowID: Row[ 'id' ] ): number;

}

class MainBaseClass extends RowBaseClass {

	public config: Config;
	public context: ObjectType;

	protected layoutProperties: LayoutProperties;

	get isCreatorMode(): boolean;
	get isEditorMode(): boolean;
	get isPickerMode(): boolean;

	public calculate(
		columns: Column[] = [
			...this.calculatingColumns.values(),
		]
	);

	public group(
		columns: Column[] = [
			...this.groupingColumns.values(),
		]
	);

	public ungroup();

	public sort(
		columns: Column[] = [
			...this.sortingColumns.values(),
		]
	);

	public unsort();

}

export class BaseClass extends MainBaseClass {

	protected readonly virtualScroll: VirtualScrollComponent;

	protected readonly confirmService: CUBConfirmService;
	protected readonly toastService: CUBToastService;

	protected readonly selectableRowCells: QueryList<ElementRef>;

	public detectChanges();

	public markForCheck();

}
