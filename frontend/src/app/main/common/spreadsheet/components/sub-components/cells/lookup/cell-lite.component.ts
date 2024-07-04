import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	DataType,
	FormulaResultFormatType
} from '@main/common/field/interfaces';
import {
	FormulaCalculatedType
} from '@main/common/field/resources';
import {
	LookupField
} from '@main/common/field/objects';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'lookup-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			lookup-field-cell
			lookup-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupFieldCellLiteComponent
	extends FieldCellLite<any> {

	@Input() public field: LookupField;

	protected readonly DATA_TYPE: typeof DataType = DataType;
	protected readonly formulaCalculatedType: typeof FormulaCalculatedType
		= FormulaCalculatedType;
	protected readonly formulaResultFormatType: typeof FormulaResultFormatType
		= FormulaResultFormatType;

	protected isNumber(
		calculated: string | number
	): boolean {
		return typeof calculated === 'number';
	}

}
