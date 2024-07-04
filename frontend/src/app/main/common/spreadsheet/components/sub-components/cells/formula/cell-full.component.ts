import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnChanges,
	ViewChild,
	TemplateRef,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import {
	CUBPopupRef
} from '@cub/material';

import {
	FieldList,
	FormulaData,
	FormulaResultFormatType
} from '@main/common/field/interfaces';
import {
	FormulaField
} from '@main/common/field/objects';
import {
	FormulaCalculatedType
} from '@main/common/field/resources';
import {
	FormulaEditorService
} from '@main/common/field/modules/editor/components';

import {
	FieldCellEditable
} from '../field-cell-editable';

@Component({
	selector: 'formula-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			formula-cell
			formula-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaFieldCellFullComponent
	extends FieldCellEditable<FormulaData>
	implements OnChanges {

	@ViewChild( 'popupHeader' )
	private _popupHeader: TemplateRef<any>;

	@Input() public otherFields: FieldList;
	@Input() public field: FormulaField;

	protected readonly formulaCalculatedType: typeof FormulaCalculatedType
		= FormulaCalculatedType;
	protected readonly formulaResultFormatType: typeof FormulaResultFormatType
		= FormulaResultFormatType;

	protected formulaEditorRef: CUBPopupRef;

	private readonly _formulaEditorService: FormulaEditorService
		= inject( FormulaEditorService );

	override ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if ( changes.data?.currentValue?.calculated?.resultType
				=== FormulaCalculatedType.CALCULATED_ARRAY ) {
			this.data.calculated.data.value
				= JSON.stringify(
					this.data.calculated.data.value,
					null,
					2
				).replace( /\n/g, '' );
		}
	}

	/**
	 * @return {void}
	 */
	protected override onTouch() {
		if ( this.readonly
			|| this.formulaEditorRef?.isOpened ) return;

		this.formulaEditorRef
			= this
			._formulaEditorService
			.open(
				null,
				{
					data: this.data,
					field: this.field,
					otherFields: this.otherFields,
					popupHeader: this._popupHeader,
					onSaved: this._onDone.bind( this ),
				},
				{
					width: null,
					minWidth: 500,
					maxWidth: 'min-content',
					maxHeight: null,
				}
			);
	}

	/**
	 * @return {void}
	 */
	protected override onDetach() {
		super.onDetach();

		this.formulaEditorRef?.close();
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.formulaEditorRef.close();
	}

	/**
	 * @param {FormulaData} data
	 * @return {void}
	 */
	private _onDone( data: FormulaData ) {
		this.save(
			_.pick( data, [ 'value', 'params' ] )
		);

		this.formulaEditorRef?.close();
	}

}
