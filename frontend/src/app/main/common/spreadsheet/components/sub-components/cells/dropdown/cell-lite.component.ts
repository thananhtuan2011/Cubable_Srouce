import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	DropdownData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'dropdown-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			dropdown-field-cell
			dropdown-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownFieldCellLiteComponent
	extends FieldCellLite<DropdownData> {}
