import {
	DataType,
	ITextField,
	TextData
} from '../interfaces';

import { Field } from './field.object';

export class TextField
	extends Field<TextData>
	implements ITextField {

	public static readonly dataType: DataType
		= DataType.Text;

	get dataType(): DataType {
		return TextField.dataType;
	}

	/**
	 * @param {string} text
	 * @return {TextData}
	 */
	public override convertTextToData(
		text: string
	): TextData {
		if ( this.validate( text ) !== null ) {
			return;
		}

		return text;
	}

}
