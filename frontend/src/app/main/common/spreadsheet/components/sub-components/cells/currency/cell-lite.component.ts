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
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'currency-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			currency-field-cell
			currency-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFieldCellLiteComponent
	extends FieldCellLite<CurrencyData> {

	@Input() public field: CurrencyField;

}
