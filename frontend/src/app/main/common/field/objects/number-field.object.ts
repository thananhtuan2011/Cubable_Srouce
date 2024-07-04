import _ from 'lodash';

import {
	parseNumber
} from '@core/number-parser';

import {
	DataType,
	FieldExtra,
	INumberField,
	NumberDecimalPlaces,
	NumberFormat,
	NumberData
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export const parseNumberString: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			data: NumberData,
			format: NumberFormat,
			decimalPlaces: NumberDecimalPlaces
		): string {
			let str: string = String( data );

			switch ( format ) {
				case NumberFormat.CommasSeparator:
					str = _.toCommasSeparator(
						data,
						decimalPlaces
					);
					break;
				case NumberFormat.ThousandUnit:
					str = _.toThounsandUnit(
						data,
						decimalPlaces
					);
					break;
				case NumberFormat.Percent:
					str = _.toPercent(
						data,
						decimalPlaces,
						true
					) as string;
					break;
				default:
					if ( decimalPlaces ) {
						str = Number( data )
						.toFixed( decimalPlaces );
					}
			}

			return str;
		},
		function(
			data: NumberData,
			format: NumberFormat,
			decimalPlaces: NumberDecimalPlaces
		): string {
			return data
				+ '|'
				+ format
				+ '|'
				+ decimalPlaces;
		}
	);

export class NumberField
	extends Field<NumberData>
	implements INumberField {

	public static readonly dataType: DataType
		= DataType.Number;

	public format: NumberFormat;
	public decimalPlaces: NumberDecimalPlaces;
	public allowNegative: boolean;

	get dataType(): DataType {
		return NumberField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {NumberData=} data
	 * @param {NumberFormat=} format
	 * @param {NumberDecimalPlaces=} decimalPlaces
	 * @param {boolean=} allowNegative
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {NumberData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: NumberData,
		format?: NumberFormat,
		decimalPlaces?: NumberDecimalPlaces,
		allowNegative?: boolean,
		description?: string,
		isRequired?: boolean,
		initialData?: NumberData,
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

		this.format = format;
		this.decimalPlaces = decimalPlaces;
		this.allowNegative = allowNegative;
	}

	/**
	 * @param {NumberData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: NumberData = this.data
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
	 * @return {NumberData}
	 */
	public override convertTextToData(
		text: string
	): NumberData {
		const data: NumberData
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
			format: this.format,
			decimalPlaces: this.decimalPlaces,
			allowNegative: this.allowNegative,
			params: JSON.parse(
				JSON.stringify({
					format			: this.format,
					decimalPlaces	: this.decimalPlaces,
					allowNegative	: this.allowNegative,
				})
			),
		};
	}

	/**
	 * @param {NumberData=} data
	 * @return {string}
	 */
	public override toString(
		data: NumberData = this.data
	): string {
		return parseNumberString(
			data,
			this.format,
			this.decimalPlaces
		);
	}

}
