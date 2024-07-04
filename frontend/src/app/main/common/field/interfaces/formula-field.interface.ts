import {
	FormulaCalculatedType
} from '../resources';

import {
	CurrencyDecimalPlaces,
	CurrencyFormat
} from './currency-field.interface';
import {
	DateFormat,
	TimeFormat
} from './date-field.interface';
import {
	DataType,
	IField
} from './field.interface';
import {
	NumberDecimalPlaces,
	NumberFormat
} from './number-field.interface';

export enum FormulaBasicOperator {
	Plus = '+',
	Minus = '-',
	Multiply = '*',
	Divide = '/',
}

export enum FormulaResultFormatType {
	Number = 'number',
	Currency = 'currency',
	Date = 'date',
}

export type FormulaResultFormatConfig =
	FormulaConfigNumberFormat
	| FormulaConfigCurrencyFormat
	| FormulaConfigDateFormat;

export type FormulaConfigNumberFormat = {
	format?: NumberFormat;
	decimalPlaces?: NumberDecimalPlaces;
};

export type FormulaConfigCurrencyFormat = {
	currency?: string;
	format?: CurrencyFormat;
	decimalPlaces?: CurrencyDecimalPlaces;
};

export type FormulaConfigDateFormat = {
	format: DateFormat;
	timeFormat: TimeFormat;
};

export type FormulaValueParams = {
	advanced?: boolean;
	resultFormatType?: FormulaResultFormatType;
	resultFormatConfig?: FormulaResultFormatConfig;
};

export type FormulaData = {
	value: string;
	params: FormulaValueParams;
	calculated?: {
		resultType: DataType.Date
			| DataType.Text
			| DataType.Checkbox
			| DataType.Number
			| FormulaCalculatedType;
		data: any;
	};
};

export interface IFormulaField
	extends IField<FormulaData> {}
