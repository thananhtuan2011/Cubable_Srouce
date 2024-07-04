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
	selector: 'created-by-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			created-by-field-cell
			created-by-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedByFieldCellLiteComponent
	extends FieldCellLite<PeopleData> {}
