import {
	TimeFormat,
	WeekStart
} from '@core';

import {
	CUBAvatar
} from '@cub/material';

import {
	INotificationSetting
} from '../../common/modules/notification/interfaces';

import {
	ILimitation
} from '../modules/subscription/interfaces';

export interface WorkspaceSettings {
	avatar?: CUBAvatar;
	primaryColor?: string;
	locale?: string;
	timezone?: string;
	dateFormat?: string;
	timeFormat?: TimeFormat;
	weekStart?: WeekStart;
	workingWeekdays?: number[];
	cloudStorage?: {
		googleDrive: boolean;
		dropbox: boolean;
		oneDrive: boolean;
	};
	notification?: {
		userSettings: boolean;
		settings: INotificationSetting[];
	};
	limitation?: ILimitation;
}
