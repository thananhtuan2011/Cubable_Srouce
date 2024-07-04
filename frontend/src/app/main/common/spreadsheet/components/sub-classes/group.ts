import {
	TemplateRef
} from '@angular/core';
import {
	Point
} from '@angular/cdk/drag-drop';
import _ from 'lodash';

import {
	DataType
} from '@main/common/field/interfaces';

import {
	calculateBy
} from '../../helpers/calculate';
import {
	HierarchyGroup
} from '../../helpers/group';
import {
	SortingPredicateReturnType
} from '../../helpers/sort';

import {
	GroupVirtualScrollViewportComponent
} from '../sub-components/virtual-scroll/group-virtual-scroll-viewport.component';

import {
	BaseClass,
	Dimension
} from './base';
import type {
	CellOffset
} from './cell';
import type {
	Column
} from './column';
import type {
	FoundRow,
	Row,
	RowCellData
} from './row';

export type Group = HierarchyGroup & {
	offset?: {
		top?: number;
		height?: number;
	};
	collapsed?: boolean;
	items?: Row[];
	children?: Group[];
	metadata?: GroupMetadata;
};

export type GroupMetadata = {
	column: Column;
	data: any;
	isEmpty: boolean;
	calculatedResult?: Map<Column[ 'id' ], any>;
};

function calculateInGroup(
	group: Group,
	columns: Column[],
	calculatePredicate?: ( ...args ) => any
) {
	group.metadata.calculatedResult
		||= new Map();

	for ( const column of columns ) {
		group
		.metadata
		.calculatedResult
		.set(
			column.id,
			calculateBy(
				group.items,
				column.calculatingType,
				calculatePredicate
				.bind( this, column )
			)
		);
	}

	if ( !group.children ) return;

	for ( const childGroup
		of group.children ) {
		calculateInGroup(
			childGroup,
			columns,
			calculatePredicate
		);
	}
}

function findGroupAtPointerOffset(
	group: Group,
	pointerOffsetY: number
): Group {
	if ( group.children ) {
		let start: number = 0;
		let end: number
			= group
			.children
			.length - 1;

		while ( start <= end ) {
			const mid: number
				= Math.floor( ( start + end ) / 2 );
			const childGroup: Group
				= group.children[ mid ];
			const gs: number
				= childGroup.offset.top;
			const ge: number
				= childGroup.offset.top
					+ childGroup.offset.height;

			if ( pointerOffsetY < gs ) {
				end = mid - 1;
				continue;
			}

			if ( pointerOffsetY > ge ) {
				start = mid + 1;
				continue;
			}

			group = findGroupAtPointerOffset(
				childGroup,
				pointerOffsetY
			);
			break;
		}
	}

	return group;
}

function updateGroupOffsets(
	group: Group,
	itemSize: number,
	extraSize: number = 0
): number {
	let height: number;

	if ( group.collapsed ) {
		height = Dimension.GroupHeaderHeight;
	} else {
		if ( !group.children ) {
			height = group.itemCount * itemSize
				+ Dimension.GroupHeaderHeight
				+ extraSize;
		} else {
			let h: number = 0;
			let t: number
				= group.offset?.top || 0;

			if ( group.depth >= 1 ) {
				t += Dimension.GroupHeaderHeight;
			}

			for ( const childGroup
				of group.children ) {
				childGroup.offset = {
					...childGroup.offset,
					top: t,
				};

				const s: number
					= updateGroupOffsets(
						childGroup,
						itemSize,
						extraSize
					) + Dimension.GroupSpacing;

				t += s;
				h += s;
			}

			height = h + Dimension.GroupHeaderHeight;
		}
	}

	group.offset = {
		...group.offset,
		height,
	};

	return height;
}

export class GroupClass extends BaseClass {

	// protected static readonly MAX_GROUP_DEPTH: number = 3;

	protected groupVSViewport: GroupVirtualScrollViewportComponent;
	protected groupDataTemplates: ReadonlyMap<DataType, TemplateRef<any>>;
	protected rootGroup: Group;

	get groupDepth(): number {
		return this.groupingColumns?.size;
	}

	get isGrouping(): boolean {
		return this.groupDepth > 0
			&& !!this.groupDataTemplates
			&& !!this.rootGroup;
	}

	/**
	 * @param {Group} group
	 * @return {void}
	 */
	protected collapseGroup( group: Group ) {
		group.collapsed = !group.collapsed;

		this.updateGroupOffsets();
	}

	/**
	 * @param {Column[]} columns
	 * @return {void}
	 */
	protected calculateInGroup(
		columns: Column[]
	) {
		if ( !columns?.length ) {
			return;
		}

		calculateInGroup(
			this.rootGroup,
			columns,
			this.calculateColumnPredicate
		);
	}

	/**
	 * @param {Column[]} columns
	 * @return {void}
	 */
	protected sortInGroup(
		columns: Column[]
	) {
		if ( !columns?.length ) {
			return;
		}

		this.rootGroup.sort(
			this
			.sortColumnPredicate
			.bind( this, columns ),
			columns.length
		);
	}

	/**
	 * @return {void}
	 */
	protected unsortInGroup() {
		this.rootGroup.unsort();
	}

	/**
	 * @param {Group=} group
	 * @param {number=} position
	 * @return {Row}
	 */
	protected createRowInGroup(
		group: Group = this.getFocusingGroup()
			|| this.getFirstGroup(),
		position?: number
	): Row {
		const newRow: Row
			= this.createRow( position );
		let g: Group = group;

		newRow.data = {};

		do {
			newRow.data[ g.metadata.column.id ]
				= g.metadata.data;

			g = g.parent;

			if ( g === this.rootGroup ) {
				break;
			}
		} while ( g );

		group.addItems(
			[ newRow ],
			position
		);

		this.markRowsInGroupAsChanged(
			group
		);

		return newRow;
	}

	/**
	 * @param {Group} group
	 * @param {Row} sourceRow
	 * @return {Row}
	 */
	protected duplicateRowInGroup(
		group: Group,
		sourceRow: Row
	): Row {
		const newRow: Row
			= this.duplicateRow( sourceRow );

		group.addItems(
			[ newRow ],
			_.indexOf(
				group.items,
				sourceRow
			) + 1
		);

		this.markRowsInGroupAsChanged( group );

		this.virtualScroll.markForCheck();

		return newRow;
	}

	/**
	 * @param {Row[]} movedRows
	 * @param {number} movedIndex
	 * @param {Group} targetGroup
	 * @return {void}
	 */
	protected moveRowsInGroup(
		movedRows: Row[],
		movedIndex: number,
		targetGroup: Group
	) {
		const targetGroups: Group[]
			= [
				...targetGroup.findClosest(),
				targetGroup,
			];
		const rowDataNeedUpdate: RowCellData
			= {};

		for ( const group of targetGroups ) {
			if ( !group.metadata ) {
				continue;
			}

			rowDataNeedUpdate[ group.metadata.column.id ]
				= group.metadata.data;
		}

		this.updateCellsData(
			movedRows,
			rowDataNeedUpdate
		);

		let newMovedIndex: number
			= movedIndex;

		for ( const movedRow of movedRows ) {
			movedRow.data = {
				...movedRow.data,
				...rowDataNeedUpdate,
			};

			const i: number = _.indexOf(
				targetGroup.items,
				movedRow
			);

			if ( i < 0
				|| i >= movedIndex ) {
				continue;
			}

			newMovedIndex--;
		}

		// Remove items in old groups
		this.rootGroup.removeItems(
			movedRows
		);

		// Insert items to new group
		targetGroup.items.splice(
			newMovedIndex,
			0,
			...movedRows
		);

		this.markRowsInGroupAsChanged(
			targetGroup
		);
	}

	/**
	 * @return {Group}
	 */
	protected getFirstGroup(): Group {
		let group: Group
			= this.rootGroup;

		while ( group.children ) {
			group = group.children[ 0 ];
		}

		return group;
	}

	/**
	 * @return {Group}
	 */
	protected getFocusingGroup(): Group {
		const rowIndex: number
			= this
			.layoutProperties
			.cell
			.selection
			?.first
			.rowIndex;

		if ( !_.isFinite( rowIndex ) ) {
			return;
		}

		return this.findGroupByRowIndex(
			rowIndex
		);
	}

	/**
	 * @param {number} rowIndex
	 * @param {number} columnIndex
	 * @return {CellOffset}
	 */
	protected getRowCellOffsetInGroup(
		rowIndex: number,
		columnIndex: number
	): CellOffset {
		const group: Group
			= this.findGroupByRowIndex( rowIndex );

		if ( !group
			|| group.depth < this.groupDepth ) {
			return;
		}

		const left: number
			= this.layoutProperties
			.column
			.offsets[ columnIndex ];
		const top: number = group.offset.top
			+ Dimension.GroupHeaderHeight
			+ ( ( rowIndex - group.startIndex )
				* this.rowHeight );

		return { left, top };
	}

	/**
	 * @return {number}
	 */
	protected getLastRowIndexInGroup(): number {
		return this.rootGroup.items.length - 1;
	}

	/**
	 * @param {Point} pointerPosition
	 * @return {Group}
	 */
	protected findGroupAtPointerPosition(
		pointerPosition: Point
	): Group {
		let { y: pointerOffsetY }: Point
			= this.virtualScroll
			.measurePointerOffset( pointerPosition );

		pointerOffsetY
			-= Dimension.PaneVerticalPadding;

		if ( !_.isFinite( pointerOffsetY )
			|| pointerOffsetY < 0 ) {
			return;
		}

		return findGroupAtPointerOffset(
			this.rootGroup,
			pointerOffsetY
		);
	}

	/**
	 * @param {number} pointerOffsetY
	 * @return {Group}
	 */
	protected findGroupAtPointerOffset(
		pointerOffsetY: number
	): Group {
		return findGroupAtPointerOffset(
			this.rootGroup,
			pointerOffsetY
		);
	}

	/**
	 * @param {number} rowIndex
	 * @return {Group}
	 */
	protected findGroupByRowIndex(
		rowIndex: number
	): Group {
		return this.rootGroup
		.findByItemIndex( rowIndex );
	}

	/**
	 * @param {Point} pointerPosition
	 * @return {FoundRow}
	 */
	protected findRowInGroupAtPointerPosition(
		pointerPosition: Point
	): FoundRow {
		let { y: pointerOffsetY }: Point
			= this
			.virtualScroll
			.measurePointerOffset( pointerPosition );

		pointerOffsetY
			-= Dimension.PaneVerticalPadding;

		if ( !_.isFinite( pointerOffsetY )
			|| pointerOffsetY < 0 ) {
			return;
		}

		const group: Group
			= this.findGroupAtPointerOffset(
				pointerOffsetY
			);

		if ( !group
			|| group.depth
				< this.groupDepth ) {
			return;
		}

		const startOffset: number
			= group.offset.top
				+ Dimension.GroupHeaderHeight;
		const endOffset: number
			= startOffset
				+ group.offset.height;

		if ( pointerOffsetY < startOffset
			|| pointerOffsetY > endOffset ) {
			return;
		}

		const index: number = Math.floor(
			( pointerOffsetY - startOffset )
				/ this.rowHeight
		);

		return {
			group,
			row: group.items[ index ],
			rowIndex: group.startIndex + index,
			rowOffset: startOffset
				+ ( index * this.rowHeight ),
		};
	}

	/**
	 * @param {Row[ 'id' ]} rowID
	 * @return {number}
	 */
	protected findRowIndexInGroupByID(
		rowID: Row[ 'id' ]
	): number {
		return _.findIndex(
			this.rootGroup.items,
			{ id: rowID }
		);
	}

	/**
	 * @param {Group=} group
	 * @param {Row[]=} items
	 * @return {void}
	 */
	protected markRowsInGroupAsChanged(
		group: Group = this.rootGroup,
		items: Row[] = group.items
	) {
		group.items = [ ...items ];

		this.updateGroupOffsets();
	}

	/**
	 * @return {void}
	 */
	protected updateGroupOffsets() {
		updateGroupOffsets(
			this.rootGroup,
			this.rowHeight,
			!this.isPickerMode
				&& this.config.row.creatable
				? Dimension.BlankRowHeight
				: 0
		);

		this
		.groupVSViewport
		?.updateRenderedGroups();
	}

	/**
	 * @param {Column[]} groupingColumns
	 * @param {Row} row
	 * @param {number} depth
	 * @return {SortingPredicateReturnType}
	 */
	protected sortGroupPredicate(
		groupingColumns: Column[],
		row: Row,
		depth: number
	): SortingPredicateReturnType {
		const column: Column
			= groupingColumns[ groupingColumns.length - depth ];

		if ( !column ) return;

		return this.sortColumnPredicate(
			[{
				...column,
				sortingType: column.groupingType,
			}],
			0,
			row
		);
	}

	/**
	 * @param {Column[]} groupingColumns
	 * @param {Row[]} rows
	 * @param {number} depth
	 * @return {GroupMetadata}
	 */
	protected parseGroupMetadataPredicate(
		groupingColumns: Column[],
		rows: Row[],
		depth: number
	): GroupMetadata {
		const idx: number
			= groupingColumns.length - depth;
		const column: Column
			= groupingColumns[ idx ];
		let data: any;

		if ( column ) {
			data = rows[ 0 ]
			?.data
			?.[ column.id ];
			data ??= null;
		}

		return {
			column,
			data,
			isEmpty: _.isStrictEmpty( data ),
		};
	}

}
