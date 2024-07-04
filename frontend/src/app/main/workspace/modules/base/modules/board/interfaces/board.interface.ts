import { Moment } from 'moment-timezone';
import { ULID } from 'ulidx';

import { CUBAvatar } from '@cub/material/avatar';

import { BoardPermissionType } from '../../role-permission/resources';
import {
	IPermissionBoard,
	IPermissionField,
	IPermissionRecord,
	IPermissionView
} from '../../role-permission/interfaces';

export type BoardCreate = Pick<IBoard, 'name' | 'baseID'>;
export type BoardUpdate = Pick<IBoard, 'name'>;
export type BoardDuplicate = Pick<IBoard, | 'name'>;

export type IBoardPermission = {
	type: BoardPermissionType;
	detail: {
		board: IPermissionBoard;
		view: Pick<IPermissionView, 'create'>;
		field: Pick<IPermissionField, 'createAndManage'>;
		record: Pick<IPermissionRecord, 'create'>;
	};
};

export type IBoard = {
	order: number;
	name: string;
	avatar: CUBAvatar;
	permission: IBoardPermission;
	baseID: ULID;
	id: ULID;
	createdAt: Moment;
	createdBy: Moment;
	updatedAt: Moment;
};
