import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources';
import {
	ComparisonErrorType
} from '@main/common/field/modules/comparison/interfaces';

import {
	ConditionTrigger,
	Option
} from '../conditional-base.interface';

export type SingleOption = Option & {
	operator: ComparisonOperator;
	data?: any;
	error?: ComparisonErrorType;
};

export type SingleCondition
	= Partial<{ [ K in 'and' | 'or' ]: ( SingleOption | boolean )[] | SingleCondition }>;

export type SingleConditionTrigger
	= ConditionTrigger<SingleOption, SingleCondition>;
