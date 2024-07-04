import {
	inject,
	ElementRef,
	Injectable
} from '@angular/core';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	FormulaPopupComponent,
	FormulaPopupContext
} from './popup.component';

@Injectable()
export class FormulaEditorService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {FormulaData} data
	 * @param {FormulaField} field
	 * @param {FieldList} otherFields
	 * @param {OnSavedFn=} onSaved
	 * @param {OnCancelledFn=} onCancelled
	 * @param {OnDataChangedFn=} onDataChanged
	 * @param {Partial<FormulaPopupContext>=} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public open(
		origin: ElementRef | HTMLElement,
		context?: Partial<FormulaPopupContext>,
		config?: CUBPopupConfig
	): CUBPopupRef {
		return this
		._popupService
		.open(
			origin,
			FormulaPopupComponent,
			{
				...context,
			},
			{
				hasBackdrop: 'transparent',
				disableClose: true,

				...config,
			}
		);
	}

}
