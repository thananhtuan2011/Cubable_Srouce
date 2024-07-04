import {
	ULID
} from 'ulidx';

import {
	IUserValue
} from './user.interface';

export type IDialogInviteUserResult = {
	newUsers: IUserValue[];
};

export type IInviteUserData = {
	expiration: number;
	roleID: ULID;
	emails: string[];
	teamIDs?: ULID[];
};
