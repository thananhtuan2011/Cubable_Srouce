import {
	ULID
} from 'ulidx';

import {
	IField
} from './field.interface';

export type ReferenceItemID
	= ULID;

export type ReferenceData = {
	value: ReferenceItemID[];
	selected?: ReferenceRecord[];
};

export type ReferenceRecord = {
	id: ULID;
	boardID?: ULID;
	data?: any;
	error?: boolean;
};

export type ReferenceLink = {
	boardID: ULID;
	viewID: ULID;
};

export type ListBoardReference = {
	id: ULID;
	name: string;
	views?: ListViewReference[];
};

export type ListViewReference = {
	boardID?: ULID;
	id: ULID;
	name: string;
};

export type ReferenceItemsByView = {
	permissionOnView: boolean;
	records?: Partial<Pick<ReferenceRecord, 'id' | 'data'>>;
	data: ReferenceItem[];
};

export type ReferenceItem = {
	id: ULID;
	data: any;
};

export interface IReferenceField
	extends IField<ReferenceData> {
	reference: ReferenceLink;
	isMultipleSelect?: boolean;
}
