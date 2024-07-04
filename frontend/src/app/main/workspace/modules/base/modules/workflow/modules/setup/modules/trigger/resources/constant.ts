/* eslint-disable @typescript-eslint/naming-convention */

export enum TriggerType {
	ROW_CREATED = 1,
	ROW_DELETED,
	VALUE_CHANGED,
	DATE_ARRIVES,
	SCHEDULE,
};

export enum RowTriggerType {
	ANY = 1,
	CONDITION,
};

export enum ValueChangedFieldType {
	ANY = 1,
	SPECIFIC_FIELD,
};

export enum ScheduleType {
	NONE = 1,
	DAILY,
	WEEKLY,
	MONTHLY,
	YEARLY
}

export enum DayOfWeekType {
	MON = 1,
	TUE,
	WED,
	THU,
	FRI,
	SAT,
	SUB,
}

export enum EventDay {
	DAY = 1,
	WEEK,
	MONTH
};

export enum PositionTime {
	BEFORE = 1,
	AFTER,
};

export enum FrequencyTime {
	MONTHLY = 1,
	YEARLY,
};

export enum TypeTimeOption {
	TIME = 1,
	DATE,
	SCHEDULE,
};
