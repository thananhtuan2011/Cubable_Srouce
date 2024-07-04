import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	NumberData
} from '@main/common/field/interfaces';
import {
	NumberField
} from '@main/common/field/objects';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'number-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			number-field-cell
			number-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFieldCellLiteComponent
	extends FieldCellLite<NumberData> {

	@Input() public field: NumberField;

}
