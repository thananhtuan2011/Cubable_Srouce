/* eslint-disable @typescript-eslint/naming-convention */

export enum ActionType {
	NOTIFY = 1,
	CHANGE_VALUE,
	CREATE_ROW,
	DELETE_ROW
};

export enum RowActionType {
	ROW_FROM_EVENT_BEFORE = 1,
	CONDITION,
};

export enum ReceiverType {
	FIELD = 1,
	PEOPLE = 2,
}

export enum ContentMenuState {
	ROW_DATA = 1,
	RECEIVER_INFOR = 2,
}

export enum ValueType {
	STATIC = 1,
	DYNAMIC,
	EMPTY
};

export enum CalculateType {
	EQUAL = 1,
	PLUS,
	MINUS,
	MULTIPLY,
	DIVIDE
};
