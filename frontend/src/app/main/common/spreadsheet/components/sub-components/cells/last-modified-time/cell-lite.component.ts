import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	DateData
} from '@main/common/field/interfaces';
import {
	LastModifiedTimeField
} from '@main/common/field/objects';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'last-modified-time-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			last-modified-time-field-cell
			last-modified-time-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedTimeFieldCellLiteComponent
	extends FieldCellLite<DateData> {

	@Input() public field: LastModifiedTimeField;

}
