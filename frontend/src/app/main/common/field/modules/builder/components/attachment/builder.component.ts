import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	AttachmentField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'attachment-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'attachment-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentFieldBuilderComponent
	extends FieldBuilder<AttachmentField> {

	protected internalField: AttachmentField;

}
