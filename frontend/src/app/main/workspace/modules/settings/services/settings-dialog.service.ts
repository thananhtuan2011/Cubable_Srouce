import {
	Unsubscriber
} from '@core';
import {
	Injectable
} from '@angular/core';
import {
	Subject
} from 'rxjs';
import _ from 'lodash';


import {
	CONSTANT as APP_CONSTANT
} from '@resources';
import {
	CUBPopupService
} from '@cub/material/popup';

import {
	IDialogInviteUserResult
} from '../modules/workspace/modules/user-system/modules/user/interfaces';
import {
	IDialogTeamResult
} from '../modules/workspace/modules/user-system/modules/team/interfaces';
import {
	PopupInviteUserComponent
} from '../modules/workspace/modules/user-system/modules/user/components/popup-invite-user.component';


export type ISettingDialogResult = {
	key: typeof APP_CONSTANT.DIALOG_UNIQ_KEY.INVITE_USER;
	result: IDialogInviteUserResult;
} | {
	key: typeof APP_CONSTANT.DIALOG_UNIQ_KEY.TEAM;
	result: IDialogTeamResult;
};

@Unsubscriber()
@Injectable()
export class SettingsDialogService {

	public settingDialogResult$: Subject<ISettingDialogResult>
		= new Subject<ISettingDialogResult>();

	/**
	 * @constructor
	 * @param {WGCDialogService} _wgcDialogService
	 */
	constructor(
		private _popupService: CUBPopupService
	) {}

	// /**
	//  * @param {string} userID
	//  * @return {void}
	//  */
	// public openDialogUserProfile( userID: string ) {
	// 	this._wgcDialogService
	// 	.open(
	// 		DialogUserProfileComponent,
	// 		{
	// 			data		: { userID },
	// 			width		: '410px',
	// 			maxHeight	: '755px',
	// 		}
	// 	);
	// }

	/*
	 * @return {void}
	 */
	public openDialogInviteUser() {
		this._popupService.open(
			null,
			PopupInviteUserComponent,
			null,
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		)
		.afterClosed()
		.subscribe( ( result: IDialogInviteUserResult ) =>{
			this.settingDialogResult$.next(
				{
					key: APP_CONSTANT.DIALOG_UNIQ_KEY.INVITE_USER,
					result,
				}
			);
		}
		);
	}

	// /**
	//  * @param {ITeam=} team
	//  * @return {void}
	//  */
	// public openDialogTeam( team?: ITeam ) {
	// 	this._wgcDialogService
	// 	.open(
	// 		DialogTeamComponent,
	// 		{
	// 			width		: '640px',
	// 			maxHeight	: '90vh',
	// 			data		: { teamID: team?.id },
	// 		}
	// 	)
	// 	.afterClosed()
	// 	.subscribe( ( result: IDialogTeamResult ) => this.settingDialogResult$.next({ key: APP_CONSTANT.DIALOG_UNIQ_KEY.TEAM, result }) );
	// }

}
