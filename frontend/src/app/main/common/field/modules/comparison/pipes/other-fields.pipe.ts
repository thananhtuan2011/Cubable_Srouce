import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';

import {
	Field
} from '../../../interfaces';

@Pipe({
	name: 'otherFields',
})
export class OtherFieldsPipe
implements PipeTransform {

	/**
	 * @param {Field[]} data
	 * @param {Field} field
	 * @return {Field[]}
	 */
	@Memoize()
	public transform(
		data: Field[],
		field: Field
	): Field[] {
		if ( !field?.extra ) return;

		return _.filter( data, ( d: Field ) => {
			return d.extra.id !== field.extra.id;
		} );
	}

}
