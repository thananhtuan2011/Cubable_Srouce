import _ from 'lodash';
import { ulid } from 'ulidx';

import {
	sortBy,
	SortingPredicateReturnType,
	SortingType
} from './sort';

export type GroupingType = SortingType;
export type HierarchyGroup = {
	ulid?: string;
	depth?: number;
	startIndex?: number;
	itemCount?: number;
	items?: any[];
	parent?: HierarchyGroup;
	previous?: HierarchyGroup;
	children?: HierarchyGroup[];
	metadata?: any;
	sort?: typeof sort;
	unsort?: typeof unsort;
	findByItemIndex?: typeof findByItemIndex;
	findClosest?: typeof findClosest;
	addItems?: typeof addItems;
	removeItems?: typeof removeItems;
	_items?: any[];
};

function sort(
	sortingPredicate?:
		( ...args ) => SortingPredicateReturnType,
	loop: number = 1
) {
	if ( !this._items ) {
		this._items = [ ...this.items ];
	}

	this.items = sortBy(
		this.items,
		sortingPredicate,
		loop
	);

	if ( !this.children ) {
		return;
	}

	for (
		const childGroup
		of this.children
	) {
		childGroup.sort(
			sortingPredicate,
			loop
		);
	}
}

function unsort() {
	this.items = [ ...this._items ];
	this._items = null;

	if ( !this.children ) {
		return;
	}

	for (
		const childGroup
		of this.children
	) {
		childGroup.unsort();
	}
}

function addItems(
	items: any[],
	position: number = this.items.length
) {
	if ( position === -1 ) {
		return;
	}

	const targetItem: any
		= this.items[ position - 1 ];

	this.items.splice(
		position,
		0,
		...items
	);

	this.parent?.addItems(
		items,
		_.indexOf(
			this.parent.items,
			targetItem
		) + 1
	);
}

function removeItems(
	items: any[]
) {
	this.items = _.without(
		this.items,
		...items
	);

	if ( !this.children ) {
		return;
	}

	for (
		const childGroup
		of this.children
	) {
		childGroup.removeItems( items );
	}
}

function findByItemIndex(
	itemIndex: number
): HierarchyGroup {
	let group: HierarchyGroup;

	if ( this.children ) {
		let start: number = 0;
		let end: number
			= this.children.length - 1;

		while ( start <= end ) {
			const mid: number
				= Math.floor( ( start + end ) / 2 );
			const childGroup: HierarchyGroup
				= this.children[ mid ];

			if ( itemIndex
				< childGroup.startIndex ) {
				end = mid - 1;
				continue;
			}

			if (
				itemIndex
					> childGroup.startIndex
						+ childGroup.itemCount - 1
			) {
				start = mid + 1;
				continue;
			}

			group = childGroup
			.findByItemIndex(
				itemIndex
			) || childGroup;
			break;
		}
	}

	return group;
}

function findClosest(
	includeRootGroup?: boolean
): HierarchyGroup[] {
	const groups: HierarchyGroup[]
		= [];
	let parentGroup: HierarchyGroup
		= this.parent;

	while ( parentGroup ) {
		groups.unshift( parentGroup );

		parentGroup
			= parentGroup.parent;
	}

	return includeRootGroup
		? groups
		: groups.slice( 1 );
}

function groupData(
	data: any,
	groupingPredicate:
		( ...args ) => any,
	sortingPredicate:
		( ...args ) => SortingPredicateReturnType,
	depth: number = 1
): any {
	if ( depth <= 0 ) {
		return data;
	}

	const r: any = _.groupBy(
		data,
		( i: any ) =>
			groupingPredicate( i, depth )
	);

	let isReverse: boolean;

	const ks: string[]
		= _
		.chain( r )
		.keys()
		.sortBy(( k: string ): any => {
			const v: [ any, boolean ]
				= sortingPredicate(
					r[ k ][ 0 ],
					depth
				);

			isReverse = v[ 1 ];

			return v[ 0 ];
		})
		.value();

	return _.map(
		isReverse
			? ks.reverse()
			: ks,
		( k: string ) => groupData(
			r[ k ],
			groupingPredicate,
			sortingPredicate,
			depth - 1
		)
	);
}

function createHierarchy(
	data: any,
	parseMetadataPredicate?:
		( ...args ) => any,
	depth: number = 1,
	cd: number = 0
): HierarchyGroup {
	const group: HierarchyGroup = {
		depth: cd,
		sort,
		unsort,
		findByItemIndex,
		findClosest,
		addItems,
		removeItems,
		get startIndex(): number {
			return this.previous
				? this.previous.startIndex
					+ this.previous.itemCount
				: ( this.parent?.startIndex || 0 );
		},
		get itemCount(): number {
			return this.items.length;
		},
	};

	if ( cd >= depth ) {
		group.items = data as any[];
	} else {
		group.items = [];
		group.children = [];

		for ( const value of data ) {
			const childGroup: HierarchyGroup
				= createHierarchy(
					value,
					parseMetadataPredicate,
					depth,
					cd + 1
				);

			childGroup.ulid = ulid();
			childGroup.parent = group;
			childGroup.previous
				= group.children[ group.children.length - 1 ];

			group
			.children
			.push( childGroup );
			group
			.items
			.push( ...childGroup.items );
		}
	}

	group.metadata
		= parseMetadataPredicate(
			group.items,
			depth - cd + 1
		);

	return group;
}

export function groupBy(
	data: any,
	groupingPredicate?:
		( v: any, d: number ) => any,
	sortingPredicate?:
		( k: string, d: number ) => [ any, boolean ],
	parseMetadataPredicate?:
		( v: any[], d: number ) => any,
	depth?: number
): HierarchyGroup {
	return createHierarchy(
		groupData(
			data,
			groupingPredicate,
			sortingPredicate,
			depth
		),
		parseMetadataPredicate,
		depth
	);
}
