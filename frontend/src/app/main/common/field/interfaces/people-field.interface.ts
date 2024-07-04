/* eslint-disable @typescript-eslint/naming-convention */
import { Observable } from 'rxjs';
import { ULID } from 'ulidx';

import { CUBTMember } from '@cub/material/member-picker';

import { IField } from './field.interface';
import { IUser } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

export enum PeopleTypeConfig {
	ALL_WORKSPACE_MEMBER,
	CURRENT_VIEWER,
	MEMBER_SAME_TEAM,
	INDIVIDUALS,
	TEAM,
	NONE,
}

export type People = Observable<IPerson[]> | IPerson[];
export type PeopleData = {
	value: ULID[];
	selected: IUser[];
};
export type PeopleScopeSetting = IPeopleScopeSetting;
export type PeopleOption = IUser;

export interface IPerson extends CUBTMember {}

export interface IPeopleField extends IField<PeopleData> {
	people: People;
}

export interface IPeopleScopeSetting {
	type: PeopleTypeConfig;
	value?: ULID[];
}

export interface IPeopleParam {
	isMultipleSelect?: boolean;
	isNotifyAdded?: boolean;
	includeSetting: IPeopleScopeSetting;
	excludeSetting?: IPeopleScopeSetting;
}
