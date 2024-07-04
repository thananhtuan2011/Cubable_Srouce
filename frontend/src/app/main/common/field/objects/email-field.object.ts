import { validateEmail } from '@core';

import {
	DataType,
	EmailData,
	IEmailField
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export class EmailField
	extends Field<EmailData>
	implements IEmailField {

	public static readonly dataType: DataType
		= DataType.Email;

	get dataType(): DataType {
		return EmailField.dataType;
	}

	/**
	 * @param {EmailData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: EmailData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( !validateEmail( data ) ) {
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
	 * @return {EmailData}
	 */
	public override convertTextToData(
		text: string
	): EmailData {
		if ( this.validate( text ) !== null ) {
			return;
		}

		return text;
	}

}
