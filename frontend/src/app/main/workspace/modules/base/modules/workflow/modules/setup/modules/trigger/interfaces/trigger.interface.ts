
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
	EventDay,
	FrequencyTime,
	PositionTime,
	RowTriggerType,
	TriggerType
} from '../resources';

import {
	ValueChangedSetting
} from './value-changed.interface';
import {
	RowCreatedSetting
} from './row-created.interface';
import {
	RowDeleteSetting
} from './row-deleted.interface';
import {
	DateArrivesSetting
} from './date-arrives.interface';
import {
	AtScheduleTimeSetting
} from './schedule.interface';


export type TriggerKey = WorkflowBlockType.TRIGGER;

export type TriggerTypeInfo = {
	name: string;
	value: TriggerType;
	icon: string;
	addable: boolean;
	iconColor?: string;
};

export type Trigger = BlockSetup & {
	blockType: TriggerKey;
	type: TriggerType;
	settings: TriggerSetting;
	isEntry?: boolean;
};

export type RowTrigger = {
	type: RowTriggerType;
	filter?: SingleConditionTrigger;
};

export type TriggerSetting
	= ValueChangedSetting
		| RowCreatedSetting
		| RowDeleteSetting
		| DateArrivesSetting
		| AtScheduleTimeSetting;

export type DateTrigger = {
	fieldID: string;
	time?: TimeGap;
	date?: DateEvent;
	schedule?: ScheduleEvent;
};

export type DateEvent = {
	quantity: number;
	period: EventDay;
	positionTime: PositionTime;
	time: TimeGap;
};

export type ScheduleEvent = {
	frequency: FrequencyTime;
	time: TimeGap;
};

export type TimeGap = {
	hour: number;
	minute: number;
};
