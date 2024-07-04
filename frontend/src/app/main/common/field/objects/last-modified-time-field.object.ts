import { ULID } from 'ulidx';

import {
	DataType,
	DateFormat,
	FieldExtra,
	ILastModifiedTimeField,
	LastModifiedTimeData,
	TimeFormat
} from '../interfaces';

import { DateField } from './date-field.object';

export class LastModifiedTimeField
	extends DateField
	implements ILastModifiedTimeField {

	public static readonly dataType: DataType
		= DataType.LastModifiedTime;

	public targetFieldID: ULID;

	get dataType(): DataType {
		return LastModifiedTimeField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {LastModifiedTimeData=} data
	 * @param {DateFormat=} format
	 * @param {TimeFormat=} timeFormat
	 * @param {ULID=} targetFieldID
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: LastModifiedTimeData,
		format?: DateFormat,
		timeFormat?: TimeFormat,
		targetFieldID?: ULID,
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

		this.targetFieldID = targetFieldID;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			targetFieldID: this.targetFieldID,
			params: {
				...super.toJson()?.params,
				...JSON.parse(
					JSON.stringify({
						targetFieldID: this.targetFieldID,
					})
				),
			},
		};
	}

}
