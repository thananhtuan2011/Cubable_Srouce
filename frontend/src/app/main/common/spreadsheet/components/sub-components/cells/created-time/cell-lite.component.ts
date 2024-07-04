import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	DateData
} from '@main/common/field/interfaces';
import {
	CreatedTimeField
} from '@main/common/field/objects';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'created-time-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			created-time-field-cell
			created-time-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedTimeFieldCellLiteComponent
	extends FieldCellLite<DateData> {

	@Input() public field: CreatedTimeField;

}
