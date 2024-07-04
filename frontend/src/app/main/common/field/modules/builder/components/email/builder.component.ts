import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	EmailField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'email-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'email-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailFieldBuilderComponent
	extends FieldBuilder<EmailField> {

	protected internalField: EmailField;

}
