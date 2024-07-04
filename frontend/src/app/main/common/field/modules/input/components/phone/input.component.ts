import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	CoerceBoolean
} from '@core';

import {
	PhoneData
} from '../../../../interfaces';
import {
	PhoneField
} from '../../../../objects';
import _ from 'lodash';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'phone-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'phone-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			PhoneFieldInputComponent
		),
	],
})
export class PhoneFieldInputComponent
	extends FieldInputEditable<PhoneField, PhoneData> {

	@Input() @CoerceBoolean()
	public phoneOnly: boolean;

	/**
	 * @param {PhoneData} data
	 * @return {void}
	 */
	protected override onDataChanged(
		data: PhoneData
	) {
		data
			= _.isStrictEmpty( data?.phone )
				? null
				: data;

		super.onDataChanged( data );
	}

}
