import { Moment } from 'moment-timezone';
import { ULID } from 'ulidx';

import {
	SharingType,
	ViewType
} from '../resources';

export type ViewCreate = Pick<
	View,
	'boardID' | 'type' | 'name'
>;

export type ViewUpdate = Partial<Pick<
	View,
	'isDefault' | 'name' | 'isHidden'
>>;

export type ViewDuplicate = Pick<
	View,
	'name'
>;

export type ViewResponse = Pick<
	View,
	'id' | 'createdAt'
>;

export type ViewArrange = {
	boardID: ULID;
	views: Pick<View, 'id' | 'order'>[];
};

export type View = {
	isHidden: boolean;
	isDefault: boolean;
	isMain: boolean;
	canManage: boolean;
	order: number;
	name: string;
	type: ViewType;
	sharingStatus: SharingType;
	id: ULID;
	boardID: ULID;
	createdBy: ULID;
	createdAt: Moment;
	updatedAt: Moment;
};

export type ViewActiveEmit<T> = {
	view: T;
	editingForm?: boolean;
};
