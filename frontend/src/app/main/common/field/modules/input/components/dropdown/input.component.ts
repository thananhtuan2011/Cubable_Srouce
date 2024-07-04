import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';
import {
	coerceArray
} from '@angular/cdk/coercion';
import _ from 'lodash';

import {
	CoerceBoolean
} from '@core';

import {
	DropdownData,
	DropdownOptionValue
} from '../../../../interfaces';
import {
	DropdownField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'dropdown-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'dropdown-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			DropdownFieldInputComponent
		),
	],
})
export class DropdownFieldInputComponent
	extends FieldInputEditable<DropdownField, DropdownData> {

	@Input() @CoerceBoolean()
	public singleLine: boolean;

	/**
	 * @param {DropdownOptionValue | DropdownOptionValue[]} value
	 * @return {void}
	 */
	protected onValueChanged(
		value: DropdownOptionValue
			| DropdownOptionValue[],
		data: DropdownData
	) {
		let _data: DropdownData = null;

		if ( !_.isStrictEmpty( value ) ) {
			value = coerceArray( value );
			_data = { ...data, value };

			_data.selected
				= this
				.field
				.buildSelected( _data );
		}

		this.onDataChanged( _data );
	}

}
