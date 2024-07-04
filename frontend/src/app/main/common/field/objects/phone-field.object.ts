import _ from 'lodash';

import { validatePhone } from '@core';

import {
	CUBCountryCode,
	getDefaultCountryCode
} from '@cub/material/phone-field';

import {
	DataType,
	FieldExtra,
	IPhoneField,
	PhoneData
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export class PhoneField
	extends Field<PhoneData>
	implements IPhoneField {

	public static readonly dataType: DataType
		= DataType.Phone;

	public countryCode: CUBCountryCode;

	get dataType(): DataType {
		return PhoneField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {PhoneData=} data
	 * @param {CUBCountryCode=} countryCode
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {PhoneData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: PhoneData,
		countryCode: CUBCountryCode
		= getDefaultCountryCode(),
		description?: string,
		isRequired?: boolean,
		initialData?: PhoneData,
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

		this.countryCode = countryCode;
	}

	/**
	 * @param {PhoneData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: PhoneData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( !validatePhone( data?.phone ) ) {
			errors = {
				...errors,
				[ FieldValidationKey.Pattern ]: {
					field: this,
					data,
				},
			};
		}

		return errors;
	}

	/**
	 * @param {string} text
	 * @return {PhoneData}
	 */
	public override convertTextToData(
		text: string
	): PhoneData {
		let data: PhoneData;

		if ( text ) {
			data = {
				phone: text,
				countryCode: this.countryCode,
			};
		}

		if ( this.validate( data ) !== null ) {
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
			countryCode: this.countryCode,
			params: JSON.parse(
				JSON.stringify({
					countryCode: this.countryCode,
				})
			),
		};
	}

	/**
	 * @param {PhoneData=} data
	 * @return {string}
	 */
	public override toString(
		data: PhoneData = this.data
	): string {
		let str: string = '';

		if ( data ) {
			str = _.toString( data.phone );

			if ( data.countryCode ) {
				str = `${data.countryCode} ${str}`;
			}
		}

		return str;
	}

}
