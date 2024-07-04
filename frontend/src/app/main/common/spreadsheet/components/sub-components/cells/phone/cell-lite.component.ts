import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	PhoneData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'phone-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [
		'../field-cell.scss',
		'./cell.scss',
	],
	host: {
		class: `
			phone-field-cell
			phone-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneFieldCellLiteComponent
	extends FieldCellLite<PhoneData> {}
