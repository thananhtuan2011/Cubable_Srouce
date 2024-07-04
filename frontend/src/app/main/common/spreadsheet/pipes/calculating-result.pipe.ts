import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Field,
	NumberField
} from '@main/common/field/objects';
import {
	NumberFormat
} from '@main/common/field/interfaces';

import {
	CalculatingType
} from '../helpers/calculate';

@Pipe({
	name: 'calculatingResult',
	standalone: true,
})
export class CalculatingResultPipe implements PipeTransform {

	/**
	 * @param {any} data
	 * @param {CalculatingType} type
	 * @param {Field} field
	 * @return {string}
	 */
	public transform(
		data: any,
		type: CalculatingType,
		field: Field
	): string {
		if ( data === Infinity ) return '∞';

		switch ( type ) {
			case CalculatingType.DayRange:
			case CalculatingType.Empty:
			case CalculatingType.Filled:
			case CalculatingType.MonthRange:
			case CalculatingType.Unique:
				data = new NumberField(
					null,
					data,
					NumberFormat.CommasSeparator
				).toString();
				break;
			case CalculatingType.PercentEmpty:
			case CalculatingType.PercentFilled:
			case CalculatingType.PercentUnique:
				data = new NumberField(
					null,
					data,
					NumberFormat.Percent
				).toString();
				break;
			default:
				data = field.toString( data );
		}

		return data;
	}

}
