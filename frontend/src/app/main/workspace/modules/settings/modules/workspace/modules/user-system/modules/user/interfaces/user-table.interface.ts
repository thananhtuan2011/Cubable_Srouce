import {
	ULID
} from 'ulidx';

import {
	CUBAvatar
} from '@cub/material';

import {
	ITeam
} from '../../team/interfaces';
import {
	Role
} from '../../dispensation/interfaces';

export type InfoStatus = {
	color: string;
	label: string;
	value: string;
};

export interface IUserTable {
	id: ULID;
	name: string;
	avatar: CUBAvatar;
	status: number;
	email: string;
	latestLogin: string;
	isOwner: boolean;
	roleIDs: string[] | null;
	teamIDs: string[] | null;
	createdAt: string;
	joinAt: string | null;
	createdBy: string;
	createdByUser: IUserTable;
	expiration: number | null;
}

export interface IUserExtra extends IUserTable {
	error?: boolean;
	infoStatus?: InfoStatus;
	selectedTeamIDs: string[];
	teams?: ITeam[];
	isAdmin: boolean;
	isAccount: boolean;
	roles?: Role[];
	isHover?: boolean;
	isSelected?: boolean;
	isHeaderHover: boolean;
	tooltipRoles: string;
	tooltipTeams: string;
};
