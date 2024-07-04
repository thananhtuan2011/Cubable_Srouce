import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	ReferenceData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'reference-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			reference-field-cell
			reference-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceFieldCellLiteComponent
	extends FieldCellLite<ReferenceData> {}
