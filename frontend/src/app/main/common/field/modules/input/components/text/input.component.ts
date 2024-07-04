import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	TextData
} from '../../../../interfaces';
import {
	TextField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'text-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'text-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			TextFieldInputComponent
		),
	],
})
export class TextFieldInputComponent
	extends FieldInputEditable<TextField, TextData> {}
