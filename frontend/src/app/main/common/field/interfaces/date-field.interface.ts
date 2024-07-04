import {
	CUBDate
} from '@cub/material/date-picker';

import {
	IField
} from './field.interface';

export enum TimeFormat {
	None = 0,
	H12 = 'hh:mm A',
	H24 = 'HH:mm',
}

// eslint-disable-next-line @typescript-eslint/typedef
export const DATE_FORMATS = [
	'DD/MM/YYYY',
	'DD/MM/YY',
	'YYYY/MM/DD',
	'YY/MM/DD',
	'dddd, DD MMM, YYYY',
	'DD MMMM, YYYY',
	'DD MMM, YYYY',
] as const;

// eslint-disable-next-line @typescript-eslint/typedef
export const TIME_FORMATS = [
	TimeFormat.None,
	TimeFormat.H12,
	TimeFormat.H24,
] as const;

export type DateFormat
	= typeof DATE_FORMATS[ number ];
export type DateData
	= string | CUBDate;

export interface IDateField
	extends IField<DateData> {
	format?: DateFormat;
	timeFormat?: TimeFormat;
}
