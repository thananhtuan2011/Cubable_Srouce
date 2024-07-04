import _ from 'lodash';

export enum CalculatingType {
	Empty = 'Empty',
	Filled = 'Filled',
	Unique = 'Unique',
	PercentEmpty = 'PercentEmpty',
	PercentFilled = 'PercentFilled',
	PercentUnique = 'PercentUnique',
	Sum = 'Sum',
	Average = 'Average',
	Median = 'Median',
	Min = 'Min',
	Max = 'Max',
	Range = 'Range',
	DayRange = 'DayRange',
	MonthRange = 'MonthRange',
}

_.mixin({
	median: ( arr: number[] ): number => {
		if ( arr.length === 0 ) return;

		arr.sort(
			( a: number, b: number ) => a - b
		);

		const midpoint: number
			= Math.floor( arr.length / 2 );

		return arr.length % 2 === 1
			? arr[ midpoint ]
			: ( arr[ midpoint - 1 ]
				+ arr[ midpoint ] )
				/ 2;
	},
});

function countEmpty(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Empty
): number {
	return _.reduce(
		data,
		( memo: number, d: any ) => {
			d = predicate
				? predicate( d, forwardType )
				: d;

			return _.isStrictEmpty( d )
				? ++memo
				: memo;
		},
		0
	);
}

function countFilled(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Filled
): number {
	return _.reduce(
		data,
		( memo: number, d: any ) => {
			d = predicate
				? predicate( d, forwardType )
				: d;

			return _.isStrictEmpty( d )
				? memo
				: ++memo;
		},
		0
	);
}

function countUnique(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Unique
): number {
	return _.chain( data )
	.reduce( ( memo: any[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = [ ...d ].sort().toString();
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	.uniq()
	.value()
	.length;
}

function countPercentEmpty(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.PercentEmpty
): number {
	const length: number = data?.length;

	if ( !length ) return 0;

	return countEmpty(
		data,
		predicate,
		forwardType
	) / ( length || 1 );
}

function countPercentFilled(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.PercentFilled
): number {
	const length: number = data?.length;

	if ( !length ) return 0;

	return countFilled(
		data,
		predicate,
		forwardType
	) / ( length || 1 );
}

function countPercentUnique(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.PercentUnique
): number {
	const length: number = data?.length;

	if ( !length ) return 0;

	return countUnique(
		data,
		predicate,
		forwardType
	) / ( length || 1 );
}

function sum(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Sum
): number {
	return _.chain( data )
	.reduce( ( memo: number[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = sum( d );
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	.sum()
	.value();
}

function average(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Average
): number {
	return _.chain( data )
	.reduce( ( memo: number[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = average( d );
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	.mean()
	.value() || 0;
}

function median(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Median
): number {
	return _.chain( data )
	.reduce( ( memo: number[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = median( d );
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	// @ts-ignore
	.median()
	.value() || 0;
}

function min(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Min
): any {
	return _.chain( data )
	.reduce( ( memo: number[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = min( d );
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	.min()
	.value() ?? Infinity;
}

function max(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Max
): any {
	return _.chain( data )
	.reduce( ( memo: number[], d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( !_.isStrictEmpty( d ) ) {
			if ( _.isArray( d ) ) {
				d = max( d );
			}

			memo.push( d );
		}

		return memo;
	}, [] )
	.max()
	.value() ?? Infinity;
}

function range(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.Range
): number {
	let minNum: number;
	let maxNum: number;

	_.forEach( data, ( d: any ) => {
		d = predicate
			? predicate( d, forwardType )
			: d;

		if ( _.isStrictEmpty( d ) ) {
			return;
		}

		let minD: number = d;
		let maxD: number = d;

		if ( _.isArray( d ) ) {
			minD = min( d );
			maxD = max( d );
		}

		if ( minNum === undefined
			|| minD < minNum ) {
			minNum = minD;
		}

		if ( maxNum === undefined
			|| maxD > maxNum ) {
			maxNum = maxD;
		}
	} );

	return ( maxNum - minNum ) || 0;
}

function dayRange(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.DayRange
): number {
	const r: number = range(
		data,
		predicate,
		forwardType
	);

	return r / 1000 / 60 / 60 / 24;
}

function monthRange(
	data: any[],
	predicate?: ( ...args ) => any,
	forwardType: CalculatingType
	= CalculatingType.MonthRange
): number {
	const r: number = dayRange(
		data,
		predicate,
		forwardType
	);

	return r / 30;
}

export function calculateBy(
	data: any[],
	type: CalculatingType,
	predicate?: ( ...args ) => any
): any {
	let fn: Function;

	switch ( type ) {
		case CalculatingType.Empty:
			fn = countEmpty;
			break;
		case CalculatingType.Filled:
			fn = countFilled;
			break;
		case CalculatingType.Unique:
			fn = countUnique;
			break;
		case CalculatingType.PercentEmpty:
			fn = countPercentEmpty;
			break;
		case CalculatingType.PercentFilled:
			fn = countPercentFilled;
			break;
		case CalculatingType.PercentUnique:
			fn = countPercentUnique;
			break;
		case CalculatingType.Sum:
			fn = sum;
			break;
		case CalculatingType.Average:
			fn = average;
			break;
		case CalculatingType.Median:
			fn = median;
			break;
		case CalculatingType.Min:
			fn = min;
			break;
		case CalculatingType.Max:
			fn = max;
			break;
		case CalculatingType.Range:
			fn = range;
			break;
		case CalculatingType.DayRange:
			fn = dayRange;
			break;
		case CalculatingType.MonthRange:
			fn = monthRange;
			break;
	}

	return fn?.( data, predicate );
}
