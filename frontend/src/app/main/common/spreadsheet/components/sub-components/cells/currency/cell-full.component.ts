import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	CurrencyField
} from '@main/common/field/objects';
import {
	CurrencyData
} from '@main/common/field/interfaces';

import {
	FieldCellInputable
} from '../field-cell-inputable';

@Component({
	selector: 'currency-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			currency-field-cell
			currency-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFieldCellFullComponent
	extends FieldCellInputable<CurrencyData> {

	@Input() public field: CurrencyField;

}
