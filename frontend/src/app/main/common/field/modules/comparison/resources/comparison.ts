/* eslint-disable @typescript-eslint/naming-convention */
export enum ComparisonOperator {
	IS_EMPTY = 1,
	IS_NOT_EMPTY,

	IS_BETWEEN,
	IS_NOT_BETWEEN,

	IS_EXACTLY,
	IS_NOT_EXACTLY,

	IS_BEFORE,
	IS_AFTER,

	CONTAINS,
	DOES_NOT_CONTAINS,
	STARTS_WITH,
	ENDS_WITH,

	WORD_COUNT_GREATER_THAN,
	WORD_COUNT_GREATER_THAN_OR_EQUAL,
	WORD_COUNT_LESS_THAN,
	WORD_COUNT_LESS_THAN_OR_EQUAL,
	WORD_COUNT_EQUAL,

	IN,
	NOT_IN,

	GREATER_THAN,
	GREATER_THAN_OR_EQUAL,
	LESS_THAN,
	LESS_THAN_OR_EQUAL,

	COMPARE_TODAY,

	CURRENT_VIEWER,
	ANY
};

export enum ComparisonType {
	STATIC = 1,
	AUTO
};

export enum TimePeriodType {
	DAY	= 1,
	WEEK,
	MONTH,
	YEAR,
};

export enum TimePeriodPrefixType {
	THIS = 1,
	NEXT,
	LAST,
};

export enum FormulaCompareType {
	NUMBER = 'number',
	DATE = 'date',
	TEXT = 'text',
};
