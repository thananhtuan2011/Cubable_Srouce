import {
	ULID
} from 'ulidx';

import {
	WorkflowBlockType
} from '../../../../../resources';

import {
	BlockSetup
} from '../../../interfaces';

import {
	SingleConditionTrigger
} from '../../common/conditional';

import {
	ActionType,
	RowActionType
} from '../resources';

import {
	ChangeValueSetting,
	DeleteRowSetting,
	CreateRowSetting,
	NotifySetting
} from './index';

export type ActionKey = WorkflowBlockType.ACTION;

export type ActionTypeInfo = {
	name: string;
	value: ActionType;
	icon: string;
	addable: boolean;
	iconColor?: string;
};

export type Action = BlockSetup & {
	blockType: ActionKey;
	type: ActionType;
	settings: ActionSetting;
};

export type RowAction = {
	type: RowActionType;
	boardID?: ULID;
	filter?: SingleConditionTrigger;
};

export type ActionSetting
	= ChangeValueSetting
		| DeleteRowSetting
		| CreateRowSetting
		| NotifySetting; // change-value | create | delete | notify
