import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	FormulaData
} from '../../../../interfaces';
import {
	FormulaField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'formula-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'formula-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaFieldBuilderComponent
	extends FieldBuilder<FormulaField> {

	protected internalField: FormulaField;
	protected initialData: FormulaData;

	/**
	 * @param {boolean} isAdvanced
	 * @return {void}
	 */
	protected onToggleEditorMode(
		isAdvanced: boolean
	) {
		const data: FormulaData = {
			...this.initialData,
		};

		data.params ||= {};

		data.params.advanced
			= isAdvanced;

		this.onInitialDataChanged(
			this.initialData = data
		);
	}

}
