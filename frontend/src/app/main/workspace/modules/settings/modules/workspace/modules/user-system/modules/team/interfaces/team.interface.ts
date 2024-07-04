import {
	ULID
} from 'ulidx';

import {
	CUBAvatar
} from '@cub/material/avatar';
import {
	CUBMemberStatus
} from '@cub/material/member-picker';

import {
	IFieldExtra
} from '@main/common/field/interfaces';

import {
	IUser,
	IUserTable
} from '../../user/interfaces';
import {
	Role
} from '../../dispensation/interfaces';

export type ITeam = {
	id: ULID;
    name: string;
    isActive: boolean;
    avatar: CUBAvatar;
    createdBy: string;
    createdAt: Date;
    roleIDs: ULID[];
    userIDs: ULID[];
	status?: CUBMemberStatus;
};
export interface ITeamExtra extends ITeam {
	infoStatus?: any;
	teams?: ITeam[];
	roles?: Role[];
	users?: IUserTable[];
	createdByUser: IUserTable;
	tooltipRoles: string;
}

export interface ITeamValue extends ITeam {
	userIDs: string[];
	users: IUser[];
}

export interface ITeamStatus {
	value: string;
	label: string;
	color: string;
}

// export interface ITeamField extends Pick<IFieldExtra, 'id' | 'name' | 'params' | 'uniqName'> {}
export interface ITeamField
	extends Pick<IFieldExtra, 'id' | 'name' | 'params'> { uniqName?: string }

export type TeamDataUpdate = {
	name: string;
	isActive: boolean;
	roleIDs?: ULID[];
	userIDs?: ULID[];
};
