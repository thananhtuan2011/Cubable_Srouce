import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

export type CompareValueSetting = {
	filter: ConditionTrigger<SingleOption, SingleCondition>;
};
