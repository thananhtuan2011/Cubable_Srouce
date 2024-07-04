import {
	ChangeDetectionStrategy,
	Component,
	ViewChild
} from '@angular/core';
import _ from 'lodash';

import {
	CUBFormFieldComponent
} from '@cub/material/form-field';

import {
	CurrencyData
} from '../../../../interfaces';
import {
	CurrencyField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'currency-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'currency-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			CurrencyFieldInputComponent
		),
	],
})
export class CurrencyFieldInputComponent
	extends FieldInputEditable<CurrencyField, CurrencyData> {

	@ViewChild( 'input' )
	public input: CUBFormFieldComponent;

	/**
	 * @param {CurrencyData} data
	 * @return {void}
	 */
	protected override onDataChanged(
		data: CurrencyData
	) {
		data = parseFloat(
			data as
				unknown as
					string
		);

		if ( !_.isFinite( data ) ) {
			data = null;
		}

		super.onDataChanged( data );
	}

}
