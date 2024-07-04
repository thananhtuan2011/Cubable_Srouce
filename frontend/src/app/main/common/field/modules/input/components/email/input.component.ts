import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	EmailData
} from '../../../../interfaces';
import {
	EmailField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'email-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'email-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			EmailFieldInputComponent
		),
	],
})
export class EmailFieldInputComponent
	extends FieldInputEditable<EmailField, EmailData> {}
