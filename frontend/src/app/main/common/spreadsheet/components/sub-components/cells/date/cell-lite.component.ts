import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	DateData
} from '@main/common/field/interfaces';
import {
	DateField
} from '@main/common/field/objects';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'date-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			date-field-cell
			date-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFieldCellLiteComponent
	extends FieldCellLite<DateData> {

	@Input() public field: DateField;

}
