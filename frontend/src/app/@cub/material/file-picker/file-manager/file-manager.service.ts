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
	CUBFileManagerContext,
	CUBFileManagerComponent
} from './file-manager.component';

@Injectable({ providedIn: 'any' })
export class CUBFileManagerService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {CUBFileManagerContext} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public manage(
		context: CUBFileManagerContext,
		config?: CUBPopupConfig
	): CUBPopupRef {
		if ( !context.files?.length ) {
			return;
		}

		return this
		._popupService
		.open(
			null,
			CUBFileManagerComponent,
			context,
			{
				hasBackdrop: 'transparent',
				...config,
			}
		);
	}

}
