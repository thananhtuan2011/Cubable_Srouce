import { IAccount } from '@main/account/interfaces';
import { IWorkspace, IWorkspaceAccessBase } from '@main/workspace/interfaces';
import { IUser } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import { CONSTANT } from '../resources';

export type IScreenType = MapObjectValue<typeof CONSTANT.SCREEN_TYPE>;

export interface IAuth {
	accountID: string;
	accountToken?: string;
	workspaceToken?: string;
	// userID?: string;
	workspaceID?: string;
}

export interface IVerifyData {
	email: string;
	otp: string;
}

export interface IInspectInvitation {
	workspace: IWorkspace;
	account: IAccount;
	isNewAccount: boolean;
}

export interface IAcceptInvitation extends IWorkspaceAccessBase {
	accountToken: string;
	account: IAccount;
	user: IUser;
}

export interface IAccountAccessSignIn {
	account: IAccount;
	accountToken: string;
}

export interface IVerifySignUp {
	signupToken: string;
}

export interface IAccountAccessSignUp {
	accountToken: string;
	createdAccount: IAccount;
}
