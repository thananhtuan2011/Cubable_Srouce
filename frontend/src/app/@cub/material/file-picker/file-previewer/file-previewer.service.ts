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
	CUBFilePreviewerContext,
	CUBFilePreviewerComponent
} from './file-previewer.component';

@Injectable({ providedIn: 'any' })
export class CUBFilePreviewerService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {CUBFilePreviewerContext} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public preview(
		context: CUBFilePreviewerContext,
		config?: CUBPopupConfig
	): CUBPopupRef {
		if ( !context.files?.length ) {
			return;
		}

		return this
		._popupService
		.open(
			null,
			CUBFilePreviewerComponent,
			context,
			{
				hasBackdrop: 'transparent',
				...config,
			}
		);
	}

}
