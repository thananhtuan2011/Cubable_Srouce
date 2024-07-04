/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
export const CONSTANT = {
	ROLE_UNIQ_NAME: {
		ADMIN	: 'admin',
		MEMBER	: 'member',
		VIEWER 	: 'viewer',
	},
} as const;

export enum BoardPermissionType {
	NO_PERMISSION = 1,
	VIEW_ONLY = 2,
	CUSTOM = 3,
	FULL_PERMISSION = 4
}

export enum RecordManageType {
	NONE = 1,
	ASSIGNED_TO_THEM = 2,
	CREATED_BY_THEMSELVES = 3,
	ALL = 4
}

export enum FieldManageType {
	NONE = 1,
	ASSIGNED_TO_THEM = 2,
	CREATED_BY_THEMSELVES = 3,
	ALL = 4
}

export enum ActionFieldManageType {
	CUSTOM = 1,
	CAN_VIEW_ALL = 2,
	CAN_EDIT_ALL = 3,
}

export enum ActionType {
	NONE = 0,
	CAN_VIEW = 2,
	CAN_EDIT = 4,
}

export enum ViewManageType {
	CREATED_BY_THEMSELVES = 1,
	ACCESS_VIEW = 2,
}

export enum ViewAccessType {
	CREATED_BY_THEMSELVES = 1,
	CUSTOM = 2,
	ALL = 3,
}
