import {
	CheckboxData,
	DataType,
	FieldExtra,
	ICheckboxField
} from '../interfaces';
import _ from 'lodash';

import { Field } from './field.object';

export class CheckboxField
	extends Field<CheckboxData>
	implements ICheckboxField {

	public static readonly dataType: DataType
		= DataType.Checkbox;

	get dataType(): DataType {
		return CheckboxField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {CurrencyData=} data
	 * @param {string=} description
	 * @param {CheckboxData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: CheckboxData,
		description?: string,
		initialData: CheckboxData = false,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			description,
			undefined,
			initialData,
			extra
		);
	}

	/**
	 * @param {string} text
	 * @return {CheckboxData}
	 */
	public override convertTextToData(
		text: string
	): CheckboxData {
		let data: CheckboxData;

		text = _.toLower( text );

		if ( text === 'true' ) {
			data = true;
		} else if ( text === 'false' ) {
			data = false;
		}

		if ( !_.isBoolean( data )
			|| this.validate( data ) !== null ) {
			return;
		}

		return data;
	}

}
