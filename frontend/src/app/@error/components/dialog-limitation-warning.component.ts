import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { CUBDialogRef, CUB_DIALOG_REF } from '@cub/material/dialog';

import { AuthService } from '@main/auth/services';
import { CONSTANT as WORKSPACE_CONTANT } from '@main/workspace/resources';
import { CONSTANT as SETTING_CONTANT } from '@main/workspace/modules/settings/resources';
import { UserService } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

import { CONSTANT as APP_CONSTANT } from '@resources';

@Component({
	selector		: 'dialog-limitation-warning',
	templateUrl		: '../templates/dialog-limitation-warning.pug',
	styleUrls		: [ '../styles/dialog-limitation-warning.scss' ],
	host			: { class: 'dialog-limitation-warning' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class DialogLimitationWarningComponent {

	public readonly HOTLINE: typeof APP_CONSTANT.HOTLINE = APP_CONSTANT.HOTLINE;

	get isAdministrator(): boolean {
		return this._userService.isAdministrator();
	}

	/**
	 * @constructor
	 * @param {CUBDialogRef} dialogRef
	 * @param {Router} _router
	 * @param {AuthService} _authService
	 * @param {UserService} _userService
	 */
	constructor(
		@Inject( CUB_DIALOG_REF ) public dialogRef: CUBDialogRef,
		private _router: Router,
		private _authService: AuthService,
		private _userService: UserService
	) {}

	/**
	 * @return {void}
	 */
	public contact() {
		const workspaceID: string =
			this._authService.getStoredAuth().workspaceID;
		const path: string = `${WORKSPACE_CONTANT.PATH.MAIN}
			/${workspaceID}/${SETTING_CONTANT.PATH.MAIN}
			/${SETTING_CONTANT.PATH.WORKSPACE}`;

		this._router.navigate(
			[ path ],
			{
				// fragment: WORKSPACE_SETTINGS_CONSTANT.TEMPLATE_KEY.SUBSCRIPTION
			}
		);
	}

}
