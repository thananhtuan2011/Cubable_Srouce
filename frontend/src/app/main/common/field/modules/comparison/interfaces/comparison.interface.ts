import {
	ULID
} from 'ulidx';

import {
	Field
} from '../../../interfaces';

import {
	ComparisonType,
	ComparisonOperator
} from '../resources/comparison';
import {
	DataValidate,
	FormulaType
} from '../components';

export type TComparisonOperator = {
	value: ComparisonOperator;
	label: string;
};

export type ComparisonDefault = {
	operator: ComparisonOperator;
	compareType?: ComparisonType;
	formulaType?: FormulaType;
};

export type ValidateFnType
	= (
		option: DataValidate<any>,
		validFields: Field[],
		markAsTouched?: boolean,
		comparisonComponent?: any,
		comparisonModule?: ComparisonSource,
	) => ComparisonErrorType;

export type ComparisonErrorType = {
	field?: boolean;
	otherField?: boolean;
	data?: boolean;
};

export type LookupCondition = {
	fieldID?: ULID;
};

export type EventAdvance = {
	id?: ULID;
	name: string;
	lookupCondition?: LookupCondition;
	fields?: Field[];
	boardID?: ULID; // Temp
	boardName?: string;
	icon?: string;
};

export type ComparisonSpecificInfo<T> = {
	value: T;
	label: string;
	icon: string;
};

export enum ComparisonSource {
	Workflow = 1,
	Filter,
	Form,
	Lookup
};
