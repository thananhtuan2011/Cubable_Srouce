import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	TextData
} from '@main/common/field/interfaces';

import {
	FieldCellInputable
} from '../field-cell-inputable';

@Component({
	selector: 'text-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			text-field-cell
			text-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldCellFullComponent
	extends FieldCellInputable<TextData> {}
