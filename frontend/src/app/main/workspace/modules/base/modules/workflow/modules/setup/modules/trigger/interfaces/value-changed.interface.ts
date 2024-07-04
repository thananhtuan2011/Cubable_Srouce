import {
	ULID
} from 'ulidx';

import {
	ConditionTrigger,
	GroupCondition,
	GroupOption
} from '../../common/conditional';

import {
	ValueChangedFieldType
} from '../resources';

import {
	RowTrigger
} from './trigger.interface';

export type ValueChangedSetting = {
	boardID: ULID;
	row?: RowTrigger;
	field: {
		type: ValueChangedFieldType;
		filter?: ConditionTrigger<GroupOption, GroupCondition>;
	};
};
