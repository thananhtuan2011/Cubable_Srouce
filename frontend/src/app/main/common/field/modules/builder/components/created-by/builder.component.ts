import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	CreatedByField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'created-by-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'created-by-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedByFieldBuilderComponent
	extends FieldBuilder<CreatedByField> {

	protected internalField: CreatedByField;

}
