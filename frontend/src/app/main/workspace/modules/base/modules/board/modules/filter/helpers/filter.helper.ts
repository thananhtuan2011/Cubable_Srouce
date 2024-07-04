import _ from 'lodash';

import {
	Filter,
	FilterCondition,
	Option
} from '../interfaces';
import {
	LogicalOperator
} from '../resources';

type MemoDepth = {
	segment: string;
	depth?: number;
};

// func dùng để làm phẳng từng phần theo bracket và return FilterCondition
// đầu vào là MemoDepth
// trả ra conditions ( FilterCondition )
export function processSiblingItems(
	memoDepth: MemoDepth[],
	filter: Filter,
	isRealtime: boolean
): FilterCondition {
	let indexOpeningBracket: number
		= _.findIndex(
			memoDepth,
			( item: MemoDepth ) => _.isFinite( item.depth )
		);

	if ( indexOpeningBracket >= 0 ) {
		let depth: number;

		// array chứa phần từ đã được làm phẳng khi memoDepth chứa segment là bracket
		// ex: ( 1 AND 2 ) OR 3 => [{ and: [ ... ] }, { segment: 'OR' }, { segment: '3' }]
		const newFlatArray: any[] = [];

		while ( indexOpeningBracket >= 0 ) {
			depth = memoDepth[ indexOpeningBracket ].depth;

			// cắt những phần tử phẳng từ 0 đến bracket đầu tiên bỏ vô newFlatArray
			newFlatArray.push(
				...memoDepth.splice( 0, indexOpeningBracket )
			);

			// bỏ bracket '('
			memoDepth.splice( 0, 1 );

			const indexClosingBracket: number
				= _.findIndex( memoDepth, { depth } );
			const insideSiblingBracket: MemoDepth[]
				= memoDepth.splice( 0, indexClosingBracket );

			// recursion lại để làm phẳng và push vô newFlatArray
			newFlatArray.push(
				processSiblingItems( insideSiblingBracket, filter, isRealtime )
			);

			// bỏ bracket ')'
			memoDepth.splice( 0, 1 );

			indexOpeningBracket
				= _.findIndex(
					memoDepth,
					( item: MemoDepth ) => _.isFinite( item.depth )
				);
		}

		// push những phần tử phẳng còn lại vô newFlatArray
		newFlatArray.push( ...memoDepth );

		// gọi buildSiblingItems để build conditions và return FilterCondition
		return buildSiblingItems( newFlatArray, filter, isRealtime );
	}

	return buildSiblingItems( memoDepth, filter, isRealtime );
}

// đầu vào là array segment logical
// trả ra array memo chứa segment and depth of bracket
// '(' bắt đầu từ depth 1 nếu như nhiều lớp '(' thì ++ lên, khi gặp ')' thì depth --
// example: ( ( 1 AND 2 ) ) => [{ segment: '(', depth: 1 }, { segment: '(', depth: 2 }, { segment: '1' }, { segment: '2' }, { segment: ')', depth: 2 }, { segment: ')', depth: 1 }]
export function buildMemoDepth( logical: string[] ): MemoDepth[] {
	let depth: number = 0;

	return _.reduce( logical, ( memo: MemoDepth[] , segment: string ) => {
		switch ( segment ) {
			case '(':
				depth++;

				memo.push({ segment, depth });

				break;
			case ')':
				memo.push({ segment, depth });

				depth--;

				break;
			default:
				memo.push({ segment });

				break;
		}

		return memo;
	}, [] );
}

function buildSiblingItems(
	siblingArray: any[],
	filter: Filter,
	isRealtime: boolean
): FilterCondition {
	let indexORSegment: number
		= _.findIndex(
			siblingArray,
			{ segment: 'OR' }
		);

	// node OR
	if ( indexORSegment >= 0 ) {
		const nodeOR: FilterCondition = { or: [] };

		while ( indexORSegment >= 0 ) {
			// lấy ra những phần từ từ 0 => index của segment OR
			const beforeOR: any[]
				= siblingArray.splice( 0, indexORSegment );

			if ( beforeOR.length ) {
				if ( beforeOR.length === 1 ) {
					if ( _.has( beforeOR[ 0 ], 'segment' ) ) {
						const option: Option
							= filter.options[
							parseInt( beforeOR[ 0 ].segment, 10 ) - 1
							];

						( nodeOR.or as [ Option | boolean ] ).push(
							(
								isRealtime
									? option.error.data
										|| option.error.field
										|| option.error.otherField
										|| _.pick( option, [ 'fieldID', 'operator', 'data', 'order' ] )
									: option
							) as Option | boolean
						); // segment - 1 vì segment lưu annotation của options. ex: segment: '1' thì index trong options là 0
					} else {
						( nodeOR.or as [ Option | FilterCondition ] )
						.push( ...beforeOR ); // nếu là 1 condition thì push vô. ex: beforeOR = { and: [ 1, 2 ] }
					}
				} else {
					( nodeOR.or as [ Option | FilterCondition ] ).push(
						buildSiblingItems( beforeOR, filter, isRealtime )
					); // nếu length beforeOR > 1 thì recursion lại để build conditions ( FilterCondition )
				}
			}

			// bỏ segment 'OR'
			siblingArray.splice( 0, 1 );

			indexORSegment = _.findIndex( siblingArray, { segment: 'OR' } );
		}

		if ( siblingArray.length ) {
			if ( siblingArray.length === 1 ) {
				if ( _.has( siblingArray[ 0 ], 'segment' ) ) {
					const option: Option
						= filter.options[
						parseInt( siblingArray[ 0 ].segment, 10 ) - 1
						];

					( nodeOR.or as [ Option | boolean ] ).push(
						(
							isRealtime
								? option.error.data
									|| option.error.field
									|| option.error.otherField
									|| _.pick( option, [ 'fieldID', 'operator', 'data', 'order' ] )
								: option
						) as Option | boolean
					); // segment - 1 vì segment lưu annotation của options. ex: segment: '1' thì index trong options là 0
				} else {
					( nodeOR.or as [ Option | FilterCondition ] )
					.push( ...siblingArray ); // nếu là 1 condition thì push vô. ex: siblingArray = { and: [ 1, 2 ] }
				}
			} else {
				( nodeOR.or as [ Option | FilterCondition ] ).push(
					buildSiblingItems( siblingArray, filter, isRealtime )
				); // nếu length siblingArray > 1 thì recursion để build conditions ( FilterCondition )
			}
		}

		return nodeOR;
	}

	// node AND
	return _.reduce(
		siblingArray,
		( nodeAND: FilterCondition, sibling: any ) => {
			if ( sibling.segment === 'AND' ) return nodeAND;

			if ( _.has( sibling, 'segment' ) ) {
				const option: Option
					= filter.options[
					parseInt( sibling.segment, 10 ) - 1
					];

				( nodeAND.and as [ Option | boolean ] ).push(
					(
						isRealtime
							? option.error.data
								|| option.error.field
								|| option.error.otherField
								|| _.pick( option, [ 'fieldID', 'operator', 'data', 'order' ] )
							: option
					) as Option | boolean
				); // segment - 1 vì segment lưu annotation của options. ex: segment: '1' thì index trong options là 0
			} else {
				( nodeAND.and as [ Option | FilterCondition ] )
				.push( ...[ sibling ] ); // nếu là 1 condition thì push vô. ex: sibling = { and: [ 1, 2 ] }
			}

			return nodeAND;
		},
		{ and: [] }
	);
}

export function setFilterLogical(
	filter: Filter
): string {
	if ( filter.options.length === 1 ) {
		return filter.logicalExpression = '1';
	}

	let index: number = 1;
	let filterLogical: string = '';
	const logicalOperator: string
		= `${filter.logicalOperator === LogicalOperator.AND
			? ' AND '
			: ' OR '
		}`;

	_.forEach( filter.options, () => {
		if ( index >= 2 ) filterLogical += logicalOperator;

		filterLogical += `${index}`;

		index++;
	} );

	return filter.logicalExpression = filterLogical;
}
