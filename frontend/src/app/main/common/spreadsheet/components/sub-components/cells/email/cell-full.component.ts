import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	EmailData
} from '@main/common/field/interfaces';

import {
	FieldCellInputable
} from '../field-cell-inputable';

@Component({
	selector: 'email-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			email-field-cell
			email-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailFieldCellFullComponent
	extends FieldCellInputable<EmailData> {}
