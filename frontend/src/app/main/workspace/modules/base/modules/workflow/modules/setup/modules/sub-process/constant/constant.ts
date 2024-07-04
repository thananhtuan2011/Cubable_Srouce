/* eslint-disable @typescript-eslint/naming-convention */

export enum SubProcessType {
	ROW_FROM_EVENT_BEFORE = 1,
	ROW_MATCH_CONDITION = 2,
};

export enum SubProcessCompleteType {
	All = 1,
	SomeRow,
};
