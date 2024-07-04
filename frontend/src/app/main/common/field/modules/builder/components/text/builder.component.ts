import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	TextField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'text-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'text-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldBuilderComponent
	extends FieldBuilder<TextField> {

	protected internalField: TextField;

}
