import { WGCIAvatar } from '@wgc/wgc-avatar';

import { DataType } from '@main/common/field/interfaces';

import { IUserStatus } from '../../workspace/modules/user-system/modules/user/interfaces';

export interface IUserFieldValue {
    isRequired: boolean;
	isDisabled: boolean;
	isHidden: boolean;
	isCoreField: boolean;
	order: number;
	id: string;
	name: string;
	uniqName: string;
    value: any;
	dataType: DataType;
}

export interface IUserProfileData {
	name: string;
    status: IUserStatus;
    fields: IUserFieldValue[];
    avatar?: WGCIAvatar;
}

export interface IUpdateField {
	id: string;
	value: any;
}

export interface IUpdateUserProfile {
	fields: IUpdateField[];
}
