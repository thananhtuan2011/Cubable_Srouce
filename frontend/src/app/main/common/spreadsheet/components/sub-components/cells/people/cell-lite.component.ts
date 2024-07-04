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
	selector: 'people-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			people-field-cell
			people-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleFieldCellLiteComponent
	extends FieldCellLite<PeopleData> {}
