import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	EmailData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'email-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			email-field-cell
			email-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailFieldCellLiteComponent
	extends FieldCellLite<EmailData> {}
