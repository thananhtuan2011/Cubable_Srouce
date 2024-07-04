import { ULID } from 'ulidx';

import {
	ActionFieldManageType,
	ActionType,
	BoardPermissionType,
	FieldManageType,
	RecordManageType,
	ViewAccessType,
	ViewManageType
} from '../resources';

export interface IBoardPermission {
	boardID: ULID;
	boardName: string;
	permission: IBoardPermissionElement;
}

export interface IBoardPermissionElement {
	type: BoardPermissionType;
	detail?: IBoardPermissionDetail;
}

export interface IBoardPermissionDetail {
	board: IPermissionBoard;
	view: IPermissionView;
	record: IPermissionRecord;
	field: IPermissionField;
}

// permission board
export interface IPermissionBoard {
	automation: ActionType;
	formatStyle?: ActionType;
	parameter?: ActionType;
	api?: ActionType;
}

// permission field
export interface IPermissionField {
	createAndManage?: boolean;
	viewAndEdit: IFieldManage;
}

export interface IFieldManage {
	type: FieldManageType;
	all?: IFieldsPermission;
	createdByThemselves?: IFieldsPermission;
	assignedToThem?: IFieldAssignedRowPermission[];
}

export interface IFieldAssignedRowPermission extends IFieldsPermission {
	id: ULID; // todo change fieldId
}

export interface IFieldsPermission {
	type: ActionFieldManageType;
	fields?: IFieldAccess[];
}

export interface IFieldAccess {
	id: ULID;
	access?: ActionType;
}

// permission record
export interface IPermissionRecord {
	create?: boolean;
	manage: RecordManage;
}

interface RecordManage {
	type: RecordManageType;
	all?: IManageRecordPermission;
	createdByThemselves?: IManageRecordPermission;
	assignedToThem?: IAssignedRecordPermission[];
}

export interface IAssignedRecordPermission extends IManageRecordPermission {
	fieldID: ULID;
}

export interface IManageRecordPermission {
	delete: boolean;
	comment: boolean;
	editChecklist?: boolean;
	editDescription?: boolean;
	lock?: boolean;
}

// permission view
export interface IPermissionView {
	create?: boolean;
	manage?: ViewManageType;
	access: IViewAccess;
}

export interface IViewAccess {
	type: ViewAccessType;
	viewIDs?: ULID[];
}
