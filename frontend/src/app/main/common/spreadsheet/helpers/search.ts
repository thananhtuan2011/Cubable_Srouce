import _ from 'lodash';

function search(
	str: string,
	match: string
): boolean {
	if ( !_.isString( str ) ) return false;

	const searchRegExp: RegExp = _.toSearchRegExp( match );

	return str.search( searchRegExp ) >= 0;
}

export function searchBy(
	data: any[],
	searchQuery: string,
	searchingPredicate?: ( ...args ) => string
): any[] {
	return _.filter(
		data,
		( i: any ) => search(
			searchingPredicate.apply( null, i ),
			searchQuery
		)
	);
}
