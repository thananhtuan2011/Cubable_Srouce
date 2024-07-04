import {
	ChangeDetectionStrategy,
	Component,
	OnInit
} from '@angular/core';

import {
	NumberField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'number-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'number-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFieldBuilderComponent
	extends FieldBuilder<NumberField>
	implements OnInit {

	protected internalField: NumberField;

}
