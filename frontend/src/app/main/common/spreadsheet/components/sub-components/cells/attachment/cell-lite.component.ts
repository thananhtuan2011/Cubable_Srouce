import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	AttachmentData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'attachment-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			attachment-field-cell
			attachment-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentFieldCellLiteComponent
	extends FieldCellLite<AttachmentData> {}
