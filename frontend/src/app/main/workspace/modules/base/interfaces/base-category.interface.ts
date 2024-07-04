import {
	Moment
} from 'moment-timezone';
import {
	ULID
} from 'ulidx';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';

export type BaseCategoryCreate
	= Partial<Pick<IBaseCategory, 'name'>>;
export type BaseCategoryUpdate
	= Partial<Pick<IBaseCategory, 'name'>> & { baseIDs?: ULID[] };

export interface IBaseCategory {
	id: ULID;
	name: string;
	createdByUser: IUser;
	createdBy: ULID;
	createdAt: Moment;
	updatedAt: Moment;
}
