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
	DialogNotificationComponent
} from '../modules/notification/components';

@Unsubscriber()
@Injectable()
export class WorkspaceExpandService {

	private readonly _dialogService: CUBDialogService
		= inject( CUBDialogService );

	/**
	 * @return {void}
	 */
	public openDialogNotification() {
		this._dialogService
		.open(
			DialogNotificationComponent,
			null,
			{
				overlayConfig: {
					width: '516px',
					minWidth: '400px',
				},
				disableClose: false,
			}
		);
	}

}
