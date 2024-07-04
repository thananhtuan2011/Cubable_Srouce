import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	FormulaData,
	FormulaResultFormatType
} from '@main/common/field/interfaces';
import {
	FormulaCalculatedType
} from '@main/common/field/resources';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'formula-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			formula-field-cell
			formula-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaFieldCellLiteComponent
	extends FieldCellLite<FormulaData> {

	protected readonly formulaCalculatedType: typeof FormulaCalculatedType
		= FormulaCalculatedType;
	protected readonly formulaResultFormatType: typeof FormulaResultFormatType
		= FormulaResultFormatType;

}
