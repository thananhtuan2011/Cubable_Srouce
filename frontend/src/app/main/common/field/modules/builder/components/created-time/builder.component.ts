import {
	Component,
	ChangeDetectionStrategy
} from '@angular/core';

import {
	CreatedTimeField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'created-time-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'created-time-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedTimeFieldBuilderComponent
	extends FieldBuilder<CreatedTimeField> {

	protected internalField: CreatedTimeField;

}
