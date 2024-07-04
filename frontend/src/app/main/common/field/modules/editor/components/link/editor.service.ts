import {
	ElementRef,
	inject,
	Injectable
} from '@angular/core';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	LinkData
} from '@main/common/field/interfaces';

import {
	LinkEditorComponent,
	LinkEditorContext
} from './editor.component';

@Injectable({
	providedIn: 'any',
})
export class LinkEditorService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {LinkData} data
	 * @param {boolean=} readonly
	 * @param {Function=} onEdited
	 * @param {Function=} onCancelled
	 * @param {Partial<LinkEditorContext>=} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public open(
		origin: ElementRef | HTMLElement,
		data: LinkData,
		readonly?: boolean,
		onEdited?: ( data: LinkData ) => void,
		onCancelled?: () => void,
		context?: Partial<LinkEditorContext>,
		config?: CUBPopupConfig
	): CUBPopupRef {
		return this
		._popupService
		.open(
			origin,
			LinkEditorComponent,
			{
				...context,

				data,
				readonly,
				onEdited,
				onCancelled,
			},
			config
		);
	}

}
