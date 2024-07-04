import {
	IField
} from './field.interface';

export enum NumberFormat {
	CommasSeparator
		= 'commas-separator',
	ThousandUnit
		= 'thousand-unit',
	Percent
		= 'percent',
}

export type NumberDecimalPlaces
	= Exclude<NumRange<7>, 0>;
export type NumberData
	= number;

export interface INumberField
	extends IField<NumberData> {
	format?: NumberFormat;
	decimalPlaces?: NumberDecimalPlaces;
	allowNegative?: boolean;
}
