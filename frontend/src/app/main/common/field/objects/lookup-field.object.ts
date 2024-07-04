import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	ILookupField,
	LookupData,
	LookupLink
} from '../interfaces';

import { Field } from './field.object';

export class LookupField
	extends Field<LookupData>
	implements ILookupField {

	public static readonly dataType: DataType
		= DataType.Lookup;

	private _lookup: LookupLink;

	get dataType(): DataType {
		return LookupField.dataType;
	}

	get lookup(): LookupLink {
		return this._lookup;
	}
	set lookup( lookupLink: LookupLink ) {
		this._lookup = lookupLink;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {LookupData=} data
	 * @param {LookupLink=} lookup
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: LookupData,
		lookup?: LookupLink,
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

		this.lookup = lookup;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			lookup: this.lookup,
			params: JSON.parse(
				JSON.stringify({
					lookup: this.lookup,
				})
			),
		};
	}

}
