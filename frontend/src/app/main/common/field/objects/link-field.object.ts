import _ from 'lodash';

import {
	validateUrl
} from '@core';

import {
	DataType,
	ILinkField,
	LinkData
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export class LinkField
	extends Field<LinkData>
	implements ILinkField {

	public static readonly dataType: DataType
		= DataType.Link;

	get dataType(): DataType {
		return LinkField.dataType;
	}

	/**
	 * @param {LinkData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: LinkData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( !validateUrl( data?.link ) ) {
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
	 * @return {LinkData}
	 */
	public override convertTextToData(
		text: string
	): LinkData {
		let data: LinkData;

		if ( text ) {
			data = { link: text };
		}

		if ( this.validate( data )
				!== null ) {
			return;
		}

		return data;
	}

	/**
	 * @param {LinkData=} data
	 * @return {string}
	 */
	public override toString(
		data: LinkData = this.data
	): string {
		return _.toString(
			data?.link
		);
	}

}
