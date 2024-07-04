import {
	ChangeDetectionStrategy,
	Component,
	ViewChild
} from '@angular/core';

import {
	CUBDatePickerDirective
} from '@cub/material/date-picker';

import {
	DateData
} from '../../../../interfaces';
import {
	DateField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'date-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'date-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			DateFieldInputComponent
		),
	],
})
export class DateFieldInputComponent
	extends FieldInputEditable<DateField, DateData> {

	@ViewChild( 'datePicker' )
	public datePicker: CUBDatePickerDirective;

}
