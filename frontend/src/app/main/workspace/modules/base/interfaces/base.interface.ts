import {
	Moment
} from 'moment-timezone';
import {
	ULID
} from 'ulidx';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';

export type BaseCreate
	= Partial<Pick<IBase, 'name' | 'categoryID'>>;
export type BaseUpdate
	= Partial<Pick<IBase, 'name' | 'order' | 'isFavorite' | 'categoryID'>>;

export interface IBase {
	isAdmin: boolean;
	isFavorite: boolean;
	order: number;
	name: string;
	id: ULID;
	createdByUser: IUser;
	categoryID: ULID;
	createdBy: ULID;
	createdAt: Moment;
	updatedAt: Moment;
	userIDs?: ULID[];
	teamIDs?: ULID[];
}

