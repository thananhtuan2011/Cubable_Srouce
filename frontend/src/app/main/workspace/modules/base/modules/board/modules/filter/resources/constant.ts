/* eslint-disable @typescript-eslint/naming-convention */
export enum LogicalOperator {
	AND	= 1,
	OR,
	CUSTOM,
};

export enum FilterError {
	FILTER_INVALID = 'FILTER_INVALID',
}

export type ErrorCode = FilterError.FILTER_INVALID;
