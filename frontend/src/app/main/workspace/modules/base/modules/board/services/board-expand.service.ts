import {
	Injectable,
	inject
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	CUBDialogService
} from '@cub/material/dialog';

import {
	DialogDetailComponent
} from '../modules/record/modules/detail/components';
import {
	DialogItemDetailContext
} from '../modules/record/modules/detail/interfaces';

@Unsubscriber()
@Injectable()
export class BoardExpandService {

	private readonly _dialogService: CUBDialogService
		= inject( CUBDialogService );

	/**
	 * @param {DialogItemDetailContext} context
	 * @return {void}
	 */
	public openDialogItemDetail(
		context: DialogItemDetailContext
	) {
		this._dialogService
		.open(
			DialogDetailComponent,
			context,
			{
				disableClose: false,
				resizable: true,
				overlayConfig: {
					width: '680px',
					minWidth: '400px',
				},
			}
		);
	}

}
