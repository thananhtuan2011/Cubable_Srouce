import _ from 'lodash';

export const calculateOrders: ReturnType<typeof _.memoize> = _.memoize(
	(
		orders: number[],
		idx: number = 0,
		count: number = 1
	): ObjectType<number> => {
		const nextIndex: number = idx + count;
		const nextOrder: number = orders[ nextIndex ];
		let prevIndex: number = idx - 1;
		let prevOrder: number = orders[ prevIndex ];

		if ( prevOrder === nextOrder ) {
			while ( prevIndex > 0 && prevOrder === nextOrder ) {
				prevOrder = orders[ --prevIndex ];
			}

			if ( !prevOrder || prevOrder === nextOrder ) {
				prevIndex = -1;
				prevOrder = undefined;
				count = nextIndex;
			}

			count = nextIndex - prevIndex - 1;
		}

		const newOrders: ObjectType<number> = {};

		for ( let i: number = 0; i < count; i++ ) {
			newOrders[ prevIndex + i + 1 ] = calculateOrder(
				prevOrder,
				nextOrder,
				i,
				count
			);
		}

		return newOrders;
	},
	function() { return JSON.stringify( arguments ); }
);

export const calculateOrder: ReturnType<typeof _.memoize> = _.memoize(
	(
		preOrder: number,
		nextOrder: number,
		idx: number = 0,
		count: number = 1
	): number => {
		if ( !preOrder ) preOrder = 0;
		if ( !nextOrder ) nextOrder = Math.floor( preOrder ) + 1;
		if ( preOrder === nextOrder ) return preOrder;

		return preOrder
			+ ( ( ( nextOrder - preOrder ) / ( count + 1 ) ) * ( idx + 1 ) );
	},
	function() { return JSON.stringify( arguments ); }
);

export function generateUniqueName(
	existedNames: string[],
	nameToDuplicate: string,
	maxLength: number = 255,
	copySuffixFn?: ( idx: number ) => string
): string {
	if ( !existedNames?.length ) return nameToDuplicate;

	const regExp: RegExp = new RegExp(
		`^(${nameToDuplicate})(\\s*)([0-9]*)$`,
		'gi'
	);
	const lastIdx: number = _.reduce(
		existedNames,
		( memo: number, name: string ) => {
			const arr: any[] = _.matchAll( regExp, name );

			if ( arr.length ) {
				const idx: number = parseFloat( arr[ 0 ][ 3 ] ) || 0;

				if ( idx >= memo ) memo = idx + 1;
			}

			return memo;
		},
		null
	);

	copySuffixFn ||= ( idx: number ) => idx ? ` ${idx}` : '';

	const copySuffix: string = copySuffixFn( lastIdx );
	const newName: string = `${nameToDuplicate}${copySuffix}`;

	if ( newName.length <= maxLength ) return newName;

	return generateUniqueName(
		existedNames,
		nameToDuplicate.substring( 0, maxLength - 1 - copySuffix.length ),
		maxLength,
		copySuffixFn
	);
}
