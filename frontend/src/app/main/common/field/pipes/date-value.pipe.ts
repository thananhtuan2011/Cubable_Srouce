import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';

import {
	DateFormat,
	DateData,
	TimeFormat
} from '../interfaces';
import {
	parseDateString
} from '../objects';

@Pipe({
	name: 'dateValue',
	standalone: true,
})
export class DateValuePipe implements PipeTransform {

	/**
	 * @param {DateData} data
	 * @param {DateFormat=} format
	 * @param {TimeFormat=} timeFormat
	 * @return {string}
	 */
	@Memoize()
	public transform(
		data: DateData,
		format?: DateFormat,
		timeFormat?: TimeFormat
	): string {
		if ( _.isNil( data ) ) {
			return '';
		}

		return parseDateString(
			data,
			format,
			timeFormat
		);
	}

}
