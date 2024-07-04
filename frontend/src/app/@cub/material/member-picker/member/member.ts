import { ULID } from 'ulidx';

import { CUBAvatar } from '@cub/material/avatar';

enum Status {
	ACTIVE = 1,
	INACTIVE = 2,
	WAITING = 3,
};

export enum TypeOfMember {
	ALL = 1,
	USER = 2,
	TEAM = 3,
}

export type CUBMemberStatus = Status;

export type CUBTMember = {
	id: ULID;
	name: string;
	cannotRemove?: boolean;
	avatar?: CUBAvatar;
	status?: CUBMemberStatus;
	order?: number;
	type?: TypeOfMember;
	role?: { name: string };
	error?: boolean;
};

export type CUBMemberData<T> = {
	all?: boolean;
	users: T;
	teams: T;
};

export type MemberValue = CUBTMember & {
	type: TypeOfMember;
};

export type CUBMemberRemovingConfig = {
	title: string;
	confirmTitle: string;
	translateParams: ObjectType<any>;
};

export class CUBMember {

	public static readonly MEMBER_STATUS: typeof Status = Status;

}
