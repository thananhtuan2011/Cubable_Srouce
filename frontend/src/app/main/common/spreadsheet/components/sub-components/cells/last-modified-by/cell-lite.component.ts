import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	PeopleData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'last-modified-by-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			last-modified-by-field-cell
			last-modified-by-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedByFieldCellLiteComponent
	extends FieldCellLite<PeopleData> {}
