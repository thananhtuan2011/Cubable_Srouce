import {
	inject,
	Injectable
} from '@angular/core';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from '../../popup';

import {
	CUBFilePickerComponent,
	CUBFilePickerContext
} from './file-picker.component';

@Injectable({ providedIn: 'any' })
export class CUBFilePickerService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {CUBFilePickerContext} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public pick(
		context: CUBFilePickerContext,
		config?: CUBPopupConfig
	): CUBPopupRef {
		return this
		._popupService
		.open(
			null,
			CUBFilePickerComponent,
			context,
			{
				hasBackdrop: 'transparent',
				disableClose: true,
				...config,
			}
		);
	}

}
