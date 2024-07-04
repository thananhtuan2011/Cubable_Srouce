import {
	CreatedByData,
	DataType,
	FieldExtra,
	ICreatedByField
} from '../interfaces';

import { Field } from './field.object';

export class CreatedByField
	extends Field<CreatedByData>
	implements ICreatedByField {

	public static readonly dataType: DataType
		= DataType.CreatedBy;

	get dataType(): DataType {
		return CreatedByField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {CurrencyData=} data
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: CreatedByData,
		description?: string,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			description,
			undefined,
			undefined,
			extra
		);
	}

}
