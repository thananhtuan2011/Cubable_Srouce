// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	USER_STATUS: {
		ACTIVE: 1,
		INACTIVE: 2,
		REJECT_INVITE: 3,
		PENDING_INVITE: 4,
		EXPIRED_INVITE: 5,
	},
	PERMISSION_CREATE: {
		NONE: 0,
		RESTRICTED: 1,
		FLEXIBLE: 2,
		FULL: 3,
	},
	ROLE_UNIQ_NAME: {
		OWNER: 'owner',
		ADMIN: 'admin',
		MEMBER: 'member',
		GUEST: 'guest',
	},
} as const;
