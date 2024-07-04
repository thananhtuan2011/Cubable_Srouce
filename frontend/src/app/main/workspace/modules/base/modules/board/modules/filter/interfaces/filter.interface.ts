import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	ComparisonErrorType
} from '@main/common/field/modules/comparison/interfaces';
import {
	Field
} from '@main/common/field/interfaces';

import {
	LogicalOperator
} from '../resources';

export type FilterCondition
	= Partial<{ [ K in 'and' | 'or' ]: ( Option | boolean )[] | FilterCondition }>;

export type Option = {
	fieldID: string;
	operator: ComparisonOperator;
	field: Field;
	order?: number;
	data?: any;
	error?: ComparisonErrorType;
};

export type Filter = {
	conditions: FilterCondition;
	options: Option[];
	logicalOperator: LogicalOperator;
	logicalExpression: string;
};
