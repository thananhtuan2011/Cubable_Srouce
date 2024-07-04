import _ from 'lodash';

import {
	parseNumber
} from '@core/number-parser';

import {
	CurrencyData,
	CurrencyDecimalPlaces,
	CurrencyFormat,
	DataType,
	FieldExtra,
	ICurrencyField
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';
import {
	parseNumberString
} from './number-field.object';

export const parseCurrencyString: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			data: CurrencyData,
			currency: string,
			format: CurrencyFormat,
			decimalPlaces: CurrencyDecimalPlaces
		): string {
			const str: string = parseNumberString(
				data,
				format,
				decimalPlaces
			);

			return str.length
				? `${currency || ''}${str}`
				: '';
		},
		function(
			data: CurrencyData,
			currency: string,
			format: CurrencyFormat,
			decimalPlaces: CurrencyDecimalPlaces
		): string {
			return data
				+ '|'
				+ currency
				+ '|'
				+ format
				+ '|'
				+ decimalPlaces;
		}
	);

export class CurrencyField
	extends Field<CurrencyData>
	implements ICurrencyField {

	public static readonly dataType: DataType
		= DataType.Currency;

	public currency: string;
	public format: CurrencyFormat;
	public decimalPlaces: CurrencyDecimalPlaces;
	public allowNegative: boolean;

	get dataType(): DataType {
		return CurrencyField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {CurrencyData=} data
	 * @param {string=} currency
	 * @param {CurrencyFormat=} format
	 * @param {CurrencyDecimalPlaces=} decimalPlaces
	 * @param {boolean=} allowNegative
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {CurrencyData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: CurrencyData,
		currency?: string,
		format?: CurrencyFormat,
		decimalPlaces?: CurrencyDecimalPlaces,
		allowNegative?: boolean,
		description?: string,
		isRequired?: boolean,
		initialData?: CurrencyData,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			description,
			isRequired,
			initialData,
			extra
		);

		this.currency = currency;
		this.format = format;
		this.decimalPlaces = decimalPlaces;
		this.allowNegative = allowNegative;
	}

	/**
	 * @param {CurrencyData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: CurrencyData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( !this.allowNegative
			&& _.isFinite( data )
			&& data < 0 ) {
			errors = {
				...errors,
				[ FieldValidationKey.Min ]: {
					field: this,
					data,
					min: 0,
				},
			};
		}

		return errors;
	}

	/**
	 * @param {string} text
	 * @return {CurrencyData}
	 */
	public override convertTextToData(
		text: string
	): CurrencyData {
		const data: CurrencyData
			= parseNumber(
				text,
				this.allowNegative
			);

		if ( !_.isFinite( data )
			|| this.validate( data ) !== null ) {
			return;
		}

		return data;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			currency: this.currency,
			format: this.format,
			decimalPlaces: this.decimalPlaces,
			allowNegative: this.allowNegative,
			params: JSON.parse(
				JSON.stringify({
					currency: this.currency,
					format: this.format,
					decimalPlaces: this.decimalPlaces,
					allowNegative: this.allowNegative,
				})
			),
		};
	}

	/**
	 * @param {CurrencyData=} data
	 * @return {string}
	 */
	public override toString(
		data: CurrencyData = this.data
	): string {
		return parseCurrencyString(
			data,
			this.currency,
			this.format,
			this.decimalPlaces
		);
	}

}
