import {
	Moment
} from 'moment-timezone';

import {
	WorkspaceSettings
} from '../modules/settings/modules/workspace/interfaces';
import {
	IUserInfo
} from '../modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

export interface IWorkspace {
	joined: boolean;
	id: string;
	name: string;
	invitedToken: string;
	isOwner?: boolean;
	settings?: WorkspaceSettings;
	createdAt?: Moment;
}

export interface IWorkspaceData {
	unreadNotificationCount: number;
}

export interface IWorkspaceAccessBase {
	workspace: IWorkspace;
	workspaceToken: string;
}

export interface IWorkspaceCreate {
	createdWorkspace: IWorkspace;
	workspaceToken: string;
}

export interface IWorkspaceAccess extends IWorkspaceAccessBase {
	user: IUserInfo;
}
