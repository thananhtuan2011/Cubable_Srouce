import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import { Memoize } from '@core';

@Pipe({
	name: 'stripHtml',
})
export class StripHtmlPipe
implements PipeTransform {

	/**
	 * @param {string} html
	 * @return {string}
	 */
	@Memoize()
	public transform(
		html: string
	): string {
		if ( !html ) return;

		return _.stripHtml( html );
	}

}
