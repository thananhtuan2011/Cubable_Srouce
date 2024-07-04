import {
	ULID
} from 'ulidx';

import {
	ITeam
} from '../../team/interfaces';
import {
	IUserTable
} from '../../user/interfaces';

export type IRole = {
	id: ULID;
	name: string;
	description?: string;
	uniqName?: string;
};

export type Role = IRole & {
	isActive?: boolean;
	canCreateBase?: boolean;
	canDeleteBase?: boolean;
	canInviteNewUser?: boolean;
	teamIDs?: ULID[];
	userIDs?: ULID[];
};

export interface IRoleExtra extends Role {
	selectedUsers?: Pick<IUserTable, 'id' | 'name' | 'avatar' | 'status' | 'email'>[];
	selectedTeams?: ITeam[];
}
export type UpdateRoleMember
	= Partial<Pick<Role, 'userIDs' | 'teamIDs' >>;
