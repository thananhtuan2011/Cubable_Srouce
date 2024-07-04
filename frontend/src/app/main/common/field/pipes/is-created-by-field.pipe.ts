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
	name: 'isCreatedByField',
	standalone: true,
})
export class IsCreatedByFieldPipe implements PipeTransform {

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
			? field.dataType === DataType.CreatedBy
			: field === DataType.CreatedBy;
	}

}
