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

type OptionExtra = {
	operator: ComparisonOperator; // need define
	data: any;
	error?: ComparisonErrorType; // FE
};

export type SourceOption = OptionExtra;
export type DestinationOption = OptionExtra;

export type GroupOption = Option & {
	source: SourceOption;
	destination: DestinationOption;
};

export type GroupCondition
	= Partial<{ [ K in 'and' | 'or' ]: ( GroupOption | boolean )[] | GroupCondition }>;

export type GroupConditionTrigger
	= ConditionTrigger<GroupOption, GroupCondition>;
