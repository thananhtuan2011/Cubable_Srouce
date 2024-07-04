import {
	ULID
} from 'ulidx';

import {
	BoardField
} from '../../../../../interfaces';

import {
	UpdateItemDetail
} from '../../../interfaces';

export type DialogItemDetailContext = {
	itemID: ULID;
	boardID?: ULID;
	itemName?: string;
	viewID?: ULID;
	fields?: BoardField[];
	itemIDs?: ULID[];
	lookupContext?: any;
};

export type DialogItemChange = {
	type: 'delete';
	data: ULID;
} | {
	type: 'update';
	data: UpdateItemDetail;
};
