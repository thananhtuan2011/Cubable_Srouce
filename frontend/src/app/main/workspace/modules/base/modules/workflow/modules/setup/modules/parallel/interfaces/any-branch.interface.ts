import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';
import {
	ParallelType
} from './parallel.interface';

export type AnyBranchSetting = {
	type: ParallelType;
    filter?: ConditionTrigger<SingleOption, SingleCondition>;
};
