import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	TextData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'text-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			text-field-cell
			text-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldCellLiteComponent
	extends FieldCellLite<TextData> {}
