import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	ILastModifiedByField,
	LastModifiedByData
} from '../interfaces';

import { Field } from './field.object';

export class LastModifiedByField
	extends Field<LastModifiedByData>
	implements ILastModifiedByField {

	public static readonly dataType: DataType
		= DataType.LastModifiedBy;

	public targetFieldID: ULID;

	get dataType(): DataType {
		return LastModifiedByField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {LastModifiedByData=} data
	 * @param {ULID=} targetFieldID
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: LastModifiedByData,
		targetFieldID?: ULID,
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

		this.targetFieldID = targetFieldID;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			targetFieldID: this.targetFieldID,
			params: JSON.parse(
				JSON.stringify({
					targetFieldID: this.targetFieldID,
				})
			),
		};
	}

}
