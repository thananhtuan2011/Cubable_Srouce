import {
	ChangeDetectionStrategy,
	Component,
	Input,
	inject
} from '@angular/core';

import {
	untilCmpDestroyed
} from '@core';

import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	FormulaCalculatedType
} from '@main/common/field/resources';

import {
	FieldList,
	FormulaData,
	FormulaResultFormatType
} from '../../../../interfaces';
import {
	FormulaField
} from '../../../../objects';

import {
	FormulaEditorService
} from '../../../editor/components';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'formula-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'formula-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			FormulaFieldInputComponent
		),
	],
})
export class FormulaFieldInputComponent
	extends FieldInputEditable<FormulaField, FormulaData> {

	@Input() public otherFields: FieldList;

	protected readonly formulaCalculatedType: typeof FormulaCalculatedType
		= FormulaCalculatedType;
	protected readonly formulaResultFormatType: typeof FormulaResultFormatType
		= FormulaResultFormatType;

	protected formulaEditorPopupRef: CUBPopupRef;

	private readonly _formulaEditorService: FormulaEditorService
		= inject( FormulaEditorService );

	/**
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected override onDataChanges(
		data: FormulaData
	) {
		this.patchFormControlValue( data );
	}

	/**
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected override onDataChanged(
		data: FormulaData
	) {
		super.onDataChanged( data, true );
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected openFormulaEditorPopup(
		e: MouseEvent
	) {
		if (
			this
			.formulaEditorPopupRef
			?.isOpened
			|| this.readonly
		) {
			return;
		}

		e.stopPropagation();

		this.formulaEditorPopupRef
			= this
			._formulaEditorService
			.open(
				null,
				{
					data: this.data,
					field: this.field,
					otherFields: this.otherFields,
					onSaved: this._onSave.bind( this ),
				},
				{
					// restoreFocus:
					// 	this
					// 	.formFieldInput
					// 	.element,
				}
			);

		this
		.formulaEditorPopupRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.cdRef.markForCheck();
		});
	}

	/**
	 * @return {void}
	 */
	private _onSave(
		data: FormulaData
	) {
		this.onDataChanged( data );

		this.formulaEditorPopupRef?.close();
	}

}
