import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

import {
	SubProcessCompleteType
} from '../constant';

export type CompleteSetting = {
	type: SubProcessCompleteType;
	filter?: ConditionTrigger<SingleOption, SingleCondition>;
};
