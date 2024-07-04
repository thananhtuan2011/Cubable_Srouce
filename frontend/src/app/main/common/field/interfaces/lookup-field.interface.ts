import {
	ULID
} from 'ulidx';

import {
	Observable
} from 'rxjs';

import {
	Filter
} from '@main/workspace/modules/base/modules/board/modules/filter/interfaces';

import {
	DataType,
	FieldExtra,
	IField
} from './field.interface';
import {
	NumberDecimalPlaces
} from './number-field.interface';
import {
	DateFormat
} from './date-field.interface';

export enum FormatType {
	Number = 1,
	Currency,
	Date,
}

export enum Operator {
	NotApply = 'not-apply',
	CountAll = 'count-all',
	CountValues = 'count-values',
	CountUnique = 'count-unique',
	CountEmpty = 'count-empty',
	CountNotEmpty = 'count-not-empty',
	Sum = 'sum',
	Average = 'average',
	Min = 'min',
	Max = 'max',
	Med = 'med',
	Range = 'range',
	CountChecked = 'count-checked',
	CountUnchecked = 'count-unchecked',
	DayRange = 'day-range',
	MonthRange = 'month-range',
	EarliestDate = 'earliest-date',
	LatestDate = 'latest-date',
}

export type LookupSourceFields
	= Observable<FieldExtra[]>
		| FieldExtra[];
export type LookupTargetFields
	= Observable<FieldExtra[]>
		| FieldExtra[];
export type LookupData = ULID[];

export type LookupLink = {
	sourceBoardID: ULID;
	sourceFieldID: ULID;
	targetFieldID: ULID; //update
	targetDataType: DataType; //update
	sourceFieldDataType?: DataType;
	filter?: Filter;
	sourceFieldParams?: any;
	targetFieldParams?: any; //update
	operator?: Operator;
	format?: LookupFormat;
};

export type LookupFormat = {
	formatType?: FormatType;
	currency?: string;
	numberFormat?: any;
	decimalPlaces?: NumberDecimalPlaces;
	dateFormat?: DateFormat;
	timeFormat?: any;
};

export type LookupTargetDisplay = {
	id: ULID;
	value: any;
	color?: string;
	avatar?: ObjectType;
	params?: ObjectType;
};

export interface ILookupField
	extends IField<LookupData> {
	lookup: LookupLink;
}
