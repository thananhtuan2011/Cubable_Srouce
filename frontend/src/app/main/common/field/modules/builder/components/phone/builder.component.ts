import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	CUBCountryCode
} from '@cub/material/phone-field';

import {
	PhoneData
} from '../../../../interfaces';
import {
	PhoneField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'phone-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'phone-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneFieldBuilderComponent
	extends FieldBuilder<PhoneField> {

	protected internalField: PhoneField;
	protected initialData: PhoneData
		= {} as PhoneData;

	/**
	 * @param {CUBCountryCode} countryCode
	 * @return {void}
	 */
	protected onCountryCodeChange(
		countryCode: CUBCountryCode
	) {
		this
		.initialData
		.countryCode = countryCode;
	}

}
