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
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

import {
	SubProcessType
} from '../constant';

import {
	CompleteSetting
} from './complete-setting.interface';

export type SubProcessKey = WorkflowBlockType.SUB_PROCESS;

export type SubProcess = BlockSetup & {
	blockType: SubProcessKey;
	type: SubProcessType;
	settings: SubProcessSetting;
};

export type SubProcessSetting = {
	complete?: CompleteSetting;
	blockID?: ULID;
	boardID?: ULID;
	filter?: ConditionTrigger<SingleOption, SingleCondition>;
};

export type SubProcessTypeInfo = {
	name: string;
	value: string;
	icon: string;
	addable: boolean;
	iconColor?: string;
};
