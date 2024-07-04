import {
	CreatedTimeData,
	DataType,
	DateFormat,
	FieldExtra,
	ICreatedTimeField,
	TimeFormat
} from '../interfaces';

import { DateField } from './date-field.object';

export class CreatedTimeField
	extends DateField
	implements ICreatedTimeField {

	public static readonly dataType: DataType
		= DataType.CreatedTime;

	get dataType(): DataType {
		return CreatedTimeField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {CreatedTimeData=} data
	 * @param {DateFormat=} format
	 * @param {TimeFormat=} timeFormat
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: CreatedTimeData,
		format?: DateFormat,
		timeFormat?: TimeFormat,
		description?: string,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			format,
			timeFormat,
			description,
			undefined,
			undefined,
			extra
		);
	}

}
