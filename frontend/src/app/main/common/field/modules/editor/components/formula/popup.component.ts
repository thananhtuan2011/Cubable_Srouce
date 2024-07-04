import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnInit,
	TemplateRef,
	Optional
} from '@angular/core';
import {
	isObservable,
	Observable
} from 'rxjs';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBPopupRef
} from '@cub/material/popup';

import {
	FormulaData,
	FieldList,
	Field
} from '@main/common/field/interfaces';
import {
	FormulaField
} from '@main/common/field/objects';

export type FormulaPopupContext = {
	field: FormulaField;
	otherFields: FieldList;
	popupHeader: TemplateRef<any>;
	data: FormulaData;
	onSaved: ( data: FormulaData ) => void;
	onCancelled?: () => void;
};

@Component({
	selector: 'formula-popup',
	templateUrl: './popup.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaPopupComponent
implements OnInit {

	protected otherFields: FieldList;
	protected field: FormulaField;
	protected data: FormulaData;
	protected popupHeader: TemplateRef<any>;

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {RichTextEditorContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: FormulaPopupContext
	) {
		this.data
			= _.cloneDeep( this.popupContext.data );
		this.field
			= this.popupContext.field;
		this.otherFields
			= this.popupContext.otherFields;
		this.popupHeader
			= this.popupContext.popupHeader;
	}

	ngOnInit() {
		this._loadOtherFields();
	}

	/**
	 * @return {void}
	 */
	public save() {
		this
		.popupContext
		.onSaved?.(
			this.data
		);

		this.popupRef.close();
	}

	/**
	 * @param {FormulaData} data
	 * @return {void}
	 */
	protected onDataChanged( data: FormulaData ) {
		this.data = _.isStrictEmpty( data )
			? null
			: data;
	}

	/**
	 * @return {void}
	 */
	public cancel() {
		this
		.popupContext
		.onCancelled?.();

		this.popupRef.close();
	}

	/**
	 * @param {boolean} isAdvanced
	 * @return {void}
	 */
	protected onToggleEditorMode(
		isAdvanced: boolean
	) {
		const data: FormulaData = {
			...this.data,
		};

		data.params ||= {};

		data.params.advanced
			= isAdvanced;

		this.data = data;
	}

	/**
	 * @return {void}
	 */
	private _loadOtherFields() {
		const { otherFields }: FormulaPopupContext
			= this.popupContext;

		if ( !isObservable( otherFields ) ) {
			this.otherFields = otherFields;
			return;
		}

		( otherFields as Observable<Field[]> )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( fields: Field[] ) => {
			this.otherFields = fields;
		});
	}

}
