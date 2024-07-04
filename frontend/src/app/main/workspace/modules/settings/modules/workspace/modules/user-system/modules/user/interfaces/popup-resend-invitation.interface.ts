import {
	ULID
} from 'ulidx';

import {
	IRoleExtra
} from '../../dispensation/interfaces';
import {
	ITeam
} from '../../team/interfaces';

export type IDialogResendInvitationData = {
	id: string;
	email: string;
};

export type IResendInviteUserData = {
	email: string;
	expiration?: number;
	roleID?: ULID;
	teamIDs?: ULID[];
};

export type IPopupResendInviteUserData = {
	expiration: number;
	roleID: ULID;
	email: string;
	teamIDs: ULID[];
	teams: ITeam[];
	roles: IRoleExtra[];
};
