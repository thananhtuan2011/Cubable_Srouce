import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	CheckboxField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'checkbox-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'checkbox-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldBuilderComponent
	extends FieldBuilder<CheckboxField> {

	protected internalField: CheckboxField;

}
