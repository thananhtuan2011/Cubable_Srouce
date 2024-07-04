/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	CORE_FIELD_UNIQ_NAME: {
		NAME			: 'name',
		STATUS			: 'status',
		ASSIGNEE		: 'assignee',
		START_DATE		: 'startDate',
		END_DATE		: 'endDate',
		CREATED_BY		: 'createdBy',
		CREATED_AT		: 'createdAt',
		UPDATED_AT		: 'updatedAt',
		UNIQ_CODE		: 'uniqCode',
		SOURCE			: 'source',
		EMAIL			: 'email',
		PHONE			: 'phone',
		SOURCE_BOARD	: 'sourceBoard',
		NUMBER_OF_ROWS	: 'numberOfRows',
	},
	CALCULATION_TYPE: {
		COUNT			: 'count', // Temp
		COUNT_ALL		: 'count-all',
		COUNT_VALUES	: 'count-values',
		COUNT_UNIQUE	: 'count-unique',
		COUNT_EMPTY		: 'count-empty',
		COUNT_NOT_EMPTY	: 'count-not-empty',
		SUM				: 'sum',
		MIN				: 'min',
		MAX				: 'max',
		AVERAGE			: 'average',
	},
	DOCUMENT_STATUS: {
		PRIVATE	: 1,
		PUBLIC	: 2,
		SHARED	: 3,
	},
	POSITION_UNIT_FORMAT: {
		PREFIX	: 1,
		SUFFIX	: 2,
	},
	DISPLAY_FORMAT: {
		COMMAS_SEPERATOR: 'commas',
		THOUSAND		: 'k',
		PERCENT			: 'percent',
		CURRENCY		: 'currency',
		CUSTOM			: 'custom',
	},
	DECIMAL_FORMAT: {
		TENTHS				: 1,
		HUNDREDTHS			: 2,
		THOUSANDTHS			: 3,
		TEN_THOUSANDTHS		: 4,
		HUNDRED_THOUSANDTHS	: 5,
		MILLION				: 6,
	},
} as const;

export enum FormulaCalculatedType {
	CALCULATED_ARRAY = 1000,
	CALCULATED_NULL	= 1001,
	CALCULATED_UNDEFINED = 1002,
}
