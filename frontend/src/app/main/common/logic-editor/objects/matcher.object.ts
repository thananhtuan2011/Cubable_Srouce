import _ from 'lodash';

export type MatcherPredicate = ( matched: string, instance: Matcher ) => string;

export class Matcher {

	public name: string;
	public matcher: RegExp;
	public predicate: MatcherPredicate;

	/**
	 * @constructor
	 * @param {string} name
	 * @param {RegExp} matcher
	 * @param {MatcherPredicate=} predicate
	 */
	constructor(
		name: string,
		matcher: RegExp,
		predicate?: MatcherPredicate
	) {
		this.name = name;
		this.matcher = matcher;
		this.predicate = predicate;
	}

	/**
	 * @param {Matcher[]} matchers
	 * @param {string} text
	 * @return {Matcher}
	 */
	public static find(
		matchers: Matcher[],
		text: string
	): Matcher {
		for ( const matcher of matchers || [] ) {
			if ( !matcher.match( text ) ) continue;

			return matcher;
		}
	}

	/**
	 * @param {string} text
	 * @return {boolean}
	 */
	public match( text: string ): boolean {
		return !!text.match( this.matcher );
	}

	/**
	 * @param {string} matched
	 * @return {string}
	 */
	public replace( matched: string ): string {
		return _.isFunction( this.predicate )
			? this.predicate( matched, this )
			: matched;
	}

}
