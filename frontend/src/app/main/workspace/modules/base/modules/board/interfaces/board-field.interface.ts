import { Moment } from 'moment-timezone';
import { ULID } from 'ulidx';

import { IFieldExtra, IReferenceField } from '@main/common/field/interfaces';

export type BoardFieldCreate = Pick<
	BoardField,
	'boardID'
	| 'id'
	| 'dataType'
	| 'name'
	| 'params'
	| 'isRequired'
	| 'description'
	| 'initialData'
>;

export type BoardFieldDuplicate = Pick<BoardField, 'name'>
	& { newFieldID: ULID; isDuplicateValue?: boolean };
export type BoardFieldSetVisibility = Pick<BoardField, 'isHidden'>
	& { ids: ULID[] };

export type BoardFieldUpdate = Partial<Pick<
	BoardField,
	'name'
	| 'params'
	| 'isRequired'
	| 'description'
	| 'initialData'
>>;

export type BoardField = IFieldExtra & {
	isHidden: boolean;
	isPrimary: boolean;
	canEditAllRow: boolean;
	canEditOwnRow: boolean;
	canEditAssignedRow: boolean;
	id: ULID;
	boardID: ULID;
	createdAt: Moment;
	updatedAt: Moment;
};

export type FieldsOfBoard = {
	id: ULID;
	name: string;
	fields: BoardField[];
};

export type FieldDetail = BoardField & {
	name: string;
	baseName: string;
	boardName: string;
	params: IReferenceField;
};

export type ActionAffectFieldInvalid = {
	baseId?: ULID;
	boardId?: ULID;
	viewId?: ULID;
	fieldId?: ULID;
};
