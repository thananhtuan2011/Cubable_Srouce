import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	DateField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'date-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'date-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFieldBuilderComponent
	extends FieldBuilder<DateField> {

	protected internalField: DateField;

}
