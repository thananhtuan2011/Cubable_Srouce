import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Memoize
} from '@core';

import {
	Field
} from '../objects';
import {
	DataType
} from '../interfaces';

@Pipe({
	name: 'isPeopleField',
	standalone: true,
})
export class IsPeopleFieldPipe implements PipeTransform {

	/**
	 * @param {Field | DataType} field
	 * @return {boolean}
	 */
	@Memoize(
		function(
			field: Field | DataType
		): DataType {
			return field instanceof Field
				? field.dataType
				: field;
		}
	)
	public transform(
		field: Field | DataType
	): boolean {
		return field instanceof Field
			? field.dataType === DataType.People
			: field === DataType.People;
	}

}
