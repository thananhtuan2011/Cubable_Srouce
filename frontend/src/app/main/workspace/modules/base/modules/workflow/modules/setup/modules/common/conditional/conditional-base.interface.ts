import {
	ULID
} from 'ulidx';

import {
	Field
} from '@main/common/field/interfaces';

import {
	LogicalOperator
} from './constant';

export type Option = {
	fieldID: ULID;
	field: Field;
	order?: number; // need check
};

export type ConditionTrigger<O, C> = {
	logicalExpression?: string;
	options?: O[];
	logicalOperator?: LogicalOperator;
	conditions?: C;
};
