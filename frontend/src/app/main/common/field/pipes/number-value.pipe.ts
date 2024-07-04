import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';

import {
	NumberData,
	NumberDecimalPlaces,
	NumberFormat
} from '../interfaces';
import {
	parseNumberString
} from '../objects';

@Pipe({
	name: 'numberValue',
	standalone: true,
})
export class NumberValuePipe implements PipeTransform {

	/**
	 * @param {NumberData} data
	 * @param {NumberFormat=} format
	 * @param {NumberDecimalPlaces=} decimalPlaces
	 * @return {string}
	 */
	@Memoize()
	public transform(
		data: NumberData,
		format?: NumberFormat,
		decimalPlaces?: NumberDecimalPlaces
	): string {
		if ( _.isNil( data ) ) {
			return '';
		}

		return parseNumberString(
			data,
			format,
			decimalPlaces
		);
	}

}
