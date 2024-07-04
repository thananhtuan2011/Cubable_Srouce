import {
	IField
} from './field.interface';
import {
	NumberData,
	NumberDecimalPlaces,
	NumberFormat
} from './number-field.interface';

export type CurrencyFormat
	= Exclude<
		NumberFormat,
		NumberFormat.Percent
	>;
export type CurrencyDecimalPlaces
	= NumberDecimalPlaces;
export type CurrencyData
	= NumberData;

export interface ICurrencyField
	extends IField<CurrencyData> {
	currency?: string;
	format?: CurrencyFormat;
	decimalPlaces?: NumberDecimalPlaces;
	allowNegative?: boolean;
}
