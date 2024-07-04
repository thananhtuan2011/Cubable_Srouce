import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';

import {
	CurrencyData,
	CurrencyDecimalPlaces,
	CurrencyFormat
} from '../interfaces';
import {
	parseCurrencyString
} from '../objects';

@Pipe({
	name: 'currencyValue',
	standalone: true,
})
export class CurrencyValuePipe implements PipeTransform {

	/**
	 * @param {CurrencyData} data
	 * @param {string=} currency
	 * @param {CurrencyFormat=} format
	 * @param {CurrencyDecimalPlaces=} decimalPlaces
	 * @return {string}
	 */
	@Memoize()
	public transform(
		data: CurrencyData,
		currency?: string,
		format?: CurrencyFormat,
		decimalPlaces?: CurrencyDecimalPlaces
	): string {
		if ( _.isNil( data ) ) {
			return '';
		}

		return parseCurrencyString(
			data,
			currency,
			format,
			decimalPlaces
		);
	}

}
