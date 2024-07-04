import {
	ULID
} from 'ulidx';

import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

export type RowCreatedSetting = {
	boardID: ULID;
	filter: ConditionTrigger<SingleOption, SingleCondition>;
};
