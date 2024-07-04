import { InfoStatus } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	DEFAULT_LIMIT_API	: 50,
	USER_STATUS			: { ACTIVE: 1, INACTIVE: 2, WAITING: 3 },
	FIELD_ID: {
		NAME		: 'name',
		EMAIL		: 'email',
		ROLE		: 'role',
		STATUS		: 'status',
		JOINED		: 'joinedAt',
		LAST_LOGIN	: 'lastLoginAt',
		INVITED		: 'inviterId',
		TEAM		: 'team',
	},
	INVITE_EXPIRATION_VALUE: {
		NEVER		: 0,
		ONE_DAY		: 1,
		THREE_DAYS	: 3,
		SEVEN_DAYS	: 7,
	},
	ROLE_UNIQ_NAME: {
		OWNER	: 'owner',
		ADMIN	: 'admin',
		MEMBER	: 'member',
		GUEST	: 'guest',
	},
};

export enum StatusUser {
	Active = 1,
	Inactive,
    RejectInvite,
    PendingInvite,
    ExpiredInvite,
};

export const STATUS_USER:
	ReadonlyMap<StatusUser, InfoStatus>
		= new Map([
			[
				StatusUser.Active,
				{
					color: '#53CD52',
					value: 'active',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.STATUS_ACTIVE',
				},
			],

			[
				StatusUser.Inactive,
				{
					color: '#FB6514',
					value: 'inactive',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.STATUS_INACTIVE',
				},
			],

			[
				StatusUser.RejectInvite,
				{
					color: '#C4C4C7',
					value: 'reject-invite',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.STATUS_REJECT_INACTIVE',
				},
			],


			[
				StatusUser.PendingInvite,
				{
					color: '#808080',
					value: 'pending-invite',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.STATUS_PENDING_INVITE',
				},
			],
			[
				StatusUser.ExpiredInvite,
				{
					color: '#FDB022',
					value: 'expired-invite',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.STATUS_EXPIRED_INVITE',
				},
			],
		]);
