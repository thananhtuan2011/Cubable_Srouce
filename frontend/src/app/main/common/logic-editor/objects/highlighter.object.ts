import _ from 'lodash';

import {
	Matcher
} from './matcher.object';

export class Highlighter extends Matcher {

	/**
	 * @override
	 * @param {string} matched
	 * @return {string}
	 */
	public replace( matched: string ): string {
		return _.isFunction( this.predicate )
			? this.predicate( matched, this )
			: `<span class="se-${ this.name }">${ matched }</span>`;
	}

}
