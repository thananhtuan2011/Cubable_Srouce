import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	ParagraphData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'paragraph-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			paragraph-field-cell
			paragraph-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphFieldCellLiteComponent
	extends FieldCellLite<ParagraphData> {}
