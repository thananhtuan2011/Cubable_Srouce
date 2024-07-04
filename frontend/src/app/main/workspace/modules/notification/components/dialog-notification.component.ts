import {
	Component,
	Inject,
	OnInit,
	inject,
	ChangeDetectionStrategy
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CUBDialogRef,
	CUB_DIALOG_REF
} from '@cub/material/dialog';

import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	IWorkspaceAccess
} from '@main/workspace/interfaces';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	CONSTANT as BASE_CONSTANT
} from '../../base/resources';

import {
	NotificationBase
} from './notification-base';

@Unsubscriber()
@Component({
	selector: 'dialog-notification',
	templateUrl: '../templates/dialog-notification.pug',
	styleUrls: [ '../styles/dialog-notification.scss' ],
	host: { class: 'dialog-notification' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogNotificationComponent
	extends NotificationBase implements OnInit {

	protected workspaceID: ULID;

	private readonly _workspaceService: WorkspaceService
		= inject( WorkspaceService );

	constructor(
		@Inject( CUB_DIALOG_REF )
		private _dialogRef: CUBDialogRef
	) {
		super();
	}

	ngOnInit() {
		this.getListNotification();

		this._workspaceService
		.storedWorkspaceInitChange$
		.subscribe({
			next: ( workspaceAccess: IWorkspaceAccess ) => {
				this.workspaceID = workspaceAccess.workspace.id;
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected openNotificationPage() {
		window.open(
			`${ENVIRONMENT.APP_URL}
			/${WORKSPACE_CONSTANT.PATH.MAIN}
			/${this.workspaceID}
			/${BASE_CONSTANT.PATH.NOTIFICATION}`
		);
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this._dialogRef.close();
	}

}
