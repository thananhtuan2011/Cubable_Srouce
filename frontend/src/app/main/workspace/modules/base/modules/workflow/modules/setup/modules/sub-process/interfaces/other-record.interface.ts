import {
	ULID
} from 'ulidx';

import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

export type OtherRecordSetting = {
	boardID: ULID;
	filter: ConditionTrigger<SingleOption, SingleCondition>;
};
