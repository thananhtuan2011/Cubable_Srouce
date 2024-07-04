import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	LinkField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'link-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'link-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkFieldBuilderComponent
	extends FieldBuilder<LinkField> {

	protected internalField: LinkField;

}
