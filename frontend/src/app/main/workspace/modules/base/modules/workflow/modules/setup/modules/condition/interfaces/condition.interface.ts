/* eslint-disable @typescript-eslint/naming-convention */
import {
	WorkflowBlockType
} from '../../../../../resources';

import {
	BlockSetup
} from '../../../interfaces';

import {
	CompareValueSetting
} from './compare-value.interface';
import {
	FindRecordSetting
} from './find-record.interface';

export type ConditionKey = WorkflowBlockType.CONDITION;

export type Condition = BlockSetup & {
	blockType: ConditionKey;
	type: ConditionType;
	settings: ConditionSetting;
};

export type ConditionSetting
	= CompareValueSetting
	| FindRecordSetting;

export enum ConditionType {
	COMPARE_VALUE = 1,
	FIND_RECORD,
};

export type ConditionTypeInfo = {
	name: string;
	value: ConditionType;
	addable: boolean;
	description: string;
};
