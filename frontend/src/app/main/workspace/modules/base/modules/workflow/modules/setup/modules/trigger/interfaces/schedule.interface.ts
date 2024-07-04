import { Moment } from 'moment-timezone';
import {
	DayOfWeekType,
	ScheduleType
} from '../resources';

export type AtScheduleTimeSetting = {
	type?: ScheduleType;
	scheduleDetail?: AtScheduleTimeSettingNone
		| AtScheduleTimeSettingDaily
		| AtScheduleTimeSettingWeekly
		| AtScheduleTimeSettingMonthly
		| AtScheduleTimeSettingYearly;
};

export type AtScheduleTimeSettingNone = {
	date?: Moment;
	time?: { hour: number; minute: number };
};

export type AtScheduleTimeSettingDaily = {
	time?: { hour: number; minute: number };
	notApplyWeekend?: boolean;
	dateFrom?: Moment;
};

export type AtScheduleTimeSettingWeekly = {
	selectDayOfWeek?: DayOfWeekType;
	time?: { hour: number; minute: number };
	dateFrom?: Moment;
};

export type AtScheduleTimeSettingMonthly = {
	selectDayOfMonth?: number;
	lastDayOfMonth: boolean;
	time?: { hour: number; minute: number };
	dateFrom?: Moment;
};

export type AtScheduleTimeSettingYearly = {
	selectMonth?: number;
	selectDayOfMonth?: number;
	time?: { hour: number; minute: number };
	dateFrom?: Moment;
};
