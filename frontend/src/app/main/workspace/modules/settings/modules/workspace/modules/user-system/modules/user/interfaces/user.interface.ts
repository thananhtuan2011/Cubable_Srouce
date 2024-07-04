import {
	Moment
} from 'moment-timezone';
import {
	ULID
} from 'ulidx';

import {
	CUBAvatar
} from '@cub/material/avatar';

import {
	IUserPreferencesSettings
} from '@main/workspace/modules/settings/modules/user-preferences/interfaces';
import {
	IUserField
} from '@main/workspace/modules/settings/modules/workspace/modules/user-field/interfaces';

import {
	IRole,
	Role
} from '../../dispensation/interfaces';
import {
	CONSTANT as DISPENSATION_CONSTANT
} from '../../dispensation/resources';
import {
	ITeam
} from '../../team/interfaces';

import {
	CONSTANT
} from '../resources';

export type IUserStatus
	= MapObjectValue<typeof CONSTANT.USER_STATUS>;

export type IRoleUniqName
	= MapObjectValue<typeof DISPENSATION_CONSTANT.ROLE_UNIQ_NAME>;

export interface IUserStatusOption {
	name: string;
	color: string;
	value: IUserStatus;
}

export interface IUser {
	id: string;
	name: string;
	avatar: CUBAvatar;
	status: IUserStatus;
	error?: boolean;
	email?: string;
	settings?: IUserPreferencesSettings;
}

export interface IUserInfo extends Pick<IUser, 'id' | 'name' | 'avatar'> {
	userTeams: ITeam[];
	role: IUserRole;
	roles: Role[];
}

export interface IUserFieldExtra extends Omit<IUserField, 'id'> {
	id: string;
	params: ObjectType;
	createdAt: Moment;
	updatedAt: Moment;
	sorting?: any;
}

export interface IUserRole {
	id: ULID;
	name: string;
	uniqName: string;
	canCreateBase: boolean;
	canInviteNewUser: boolean;
	canDeleteBase: boolean;
}

export interface IUserValue extends Omit<IUser, 'status'> {
	role: IRole;
	joinedAt: Moment;
	lastAccessAt: Moment;
	invitedBy: IUser;
	status: IUserStatusOption;
	teams: ITeam[];
}

export interface IUserData {
	isOnboarded: boolean;
	unreadNotificationCount: number;
	user: IUserInfo | any;
}

export interface IInviteExpiration {
	value: number;
	name: string;
}
