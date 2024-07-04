/* eslint-disable @typescript-eslint/naming-convention */
import { Moment } from 'moment-timezone';
import { ULID } from 'ulidx';

import { BoardField } from '../../../interfaces';

import { ErrorCode } from '../../filter/resources';

export type RecordCreate = Pick<TRecord, 'boardID'> & {
	socketSessionID: ULID;
	records: ( Pick<TRecord, 'id'> & Partial<Pick<TRecord, 'cells'>> )[];
};
export type RecordDuplicate = Pick<TRecord, 'boardID'> & {
	socketSessionID: ULID;
	records: ( Pick<TRecord, 'id'> & { newID: ULID } )[];
};
export type RecordUpdate = Pick<TRecord,'boardID'> & {
	records: ( Pick<TRecord, 'id'> & Partial<Pick<TRecord, 'cells'>> )[];
};

export type RecordPermissionDetail = {
	comment: boolean;
	delete: boolean;
	editChecklist: boolean;
	editDescription: boolean;
	lock: boolean;
};

export type RecordData = {
	isCreator: boolean;
	id: ULID;
	boardID: ULID;
	cells: Record<BoardField[ 'id' ], any>; // { fieldID: https://docs.google.com/spreadsheets/d/10Z1s80wcTUuLjt6lhdDClCEFrSEc3L69eJmevpYN-F0/edit#gid=0 }
	permission: RecordPermissionDetail;
	createdAt: Moment;
	updatedAt: Moment;
};

export type RecordDetail = RecordData & {
	boardName: string;
	baseName: string;
	baseID: ULID;
};

export type RecordPermission = boolean | Record<BoardField[ 'id' ], boolean>;

export type TRecord = RecordData & RecordPermission;

export type RecordIDByView = {
	data: ULID[];
	code: RecordFilterCode | ErrorCode;
};

export type UpdateItemDetail = {
	recordID: ULID;
	fieldID: ULID;
	cellValue: Record<BoardField[ 'id' ], any>;
	index?: number;
};

export enum RecordFilterCode {
	HAS_FILTER = 'HAS_FILTER',
	NOT_FILTER = 'NOT_FILTER',
}
