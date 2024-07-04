import {
	Moment
} from 'moment-timezone';

import {
	CUBAvatar
} from '@cub/material/avatar';

import {
	INDUSTRY,
	NEEDING,
	ROLE,
	SIZE,
	TEAM
} from '../resources';

export interface IAccount {
	name: string;
	email: string;
	password?: string;
	avatar?: CUBAvatar;
	logoutSetting?: ILogoutSetting;
	updatedPasswordAt?: Moment;
	onBoardingFlow?: IOnBoardingFlow;
}

export interface IResetPassword {
	account: IAccount;
	resetPasswordToken: string;
}

export interface ILogoutSetting {
	type: number;
	params?: {
		periodCount: number;
		periodFormat: 'days' | 'weeks' | 'months';
		periodTime: Moment;
	};
}

export interface IOnBoardingFlow {
	isSkipped: boolean;
	collectInformation?: ICollectedInformation;
}

export interface ICollectedInformation {
	role?: MapObjectValue<typeof ROLE>;
	team?: MapObjectValue<typeof TEAM>;
	needing?: MapObjectValue<typeof NEEDING>[];
	size?: MapObjectValue<typeof SIZE>;
	industry?: MapObjectValue<typeof INDUSTRY>;
}
