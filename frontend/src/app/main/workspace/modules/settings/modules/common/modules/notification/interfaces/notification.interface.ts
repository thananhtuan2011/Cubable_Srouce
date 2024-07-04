export interface INotifcationWorkspace {
	mail: boolean;
	mobile: boolean;
	webApp: boolean;
	browsers: boolean;
}

export interface INotificationSetting {
	notificationFrom: number;
	action: INotifcationWorkspace;
	name?: string;
}
