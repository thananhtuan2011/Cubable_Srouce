import {
	ULID
} from 'ulidx';

import {
	CUBBasicEditorContent
} from '@cub/material/editor';

import {
	Field,
	FieldExtra
} from '@main/common/field/interfaces';

import {
	CalculateType,
	ValueType
} from '../resources';

import {
	RowAction
} from './action.interface';

export type FieldValueSetting = {
	fieldID: ULID;
	value: ValueGeneric | any;
	field: FieldExtra;
};

export type ValueGeneric = {
	valueType: ValueType;
	data: any;
	calculateType?: CalculateType;
	metadata?: ValueMetadata;
};

export type ValueMetadata = {
	field?: FieldExtra;
	blockID?: ULID;
	content?: CUBBasicEditorContent;
};

export type ChangeValueSetting = {
	row: RowAction;
	fields: FieldValueSetting[];
};

export type ValueDynamic = {
	blockID: ULID;
	name: string;
	fields?: Field[];
	icon?: string;
};

