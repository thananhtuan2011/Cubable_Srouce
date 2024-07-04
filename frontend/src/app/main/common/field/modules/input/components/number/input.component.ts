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
	NumberData,
	NumberFormat
} from '../../../../interfaces';
import {
	NumberField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'number-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'number-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			NumberFieldInputComponent
		),
	],
})
export class NumberFieldInputComponent
	extends FieldInputEditable<NumberField, NumberData> {

	@ViewChild( 'input' )
	public input: CUBFormFieldComponent;

	get isPercentFormat(): boolean {
		return this.field.format
				=== NumberFormat.Percent;
	}

	/**
	 * @param {NumberData} data
	 * @return {void}
	 */
	protected override onDataChanged(
		data: NumberData
	) {
		data = parseFloat(
			data as
				unknown as
					string
		);

		if ( !_.isFinite( data ) ) {
			data = null;
		} else if (
			this.isPercentFormat
		) {
			data = data / 100;
		}

		super.onDataChanged( data );
	}

}
