import { ULID } from 'ulidx';

import { IBoardPermission } from './permission.interface';

export type RoleCreate = Pick<IRole, 'name' | 'permissions'> & { description?: string; baseID: ULID };
export type RoleUpdate = Partial<Pick<IRole, 'name' | 'isActive' | 'description' | 'permissions'>>;
export type UpdateRoleMember = Partial<Pick<IRole, 'isAllBaseUsersTeams' | 'userIDs' | 'teamIDs'>>;

export interface IRole {
	id: ULID;
	name: string;
	permissions: IBoardPermission[];
	isDefault?: boolean;
	isActive?: boolean;
	isAllBaseUsersTeams?: boolean;
	uniqName?: string;
	description?: string;
	userIDs?: ULID[];
	teamIDs?: ULID[];
}
