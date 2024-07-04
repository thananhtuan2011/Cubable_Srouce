import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	IReferenceField,
	ReferenceLink,
	ReferenceData
} from '../interfaces';

import { Field } from './field.object';

export class ReferenceField
	extends Field<ReferenceData>
	implements IReferenceField {

	public static readonly dataType: DataType
		= DataType.Reference;

	public reference: ReferenceLink;
	public isMultipleSelect: boolean;

	get dataType(): DataType {
		return ReferenceField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {ReferenceData=} data
	 * @param {ReferenceLink=} reference
	 * @param {boolean=} isMultipleSelect
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {ReferenceData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: ReferenceData,
		reference?: ReferenceLink,
		isMultipleSelect: boolean = true,
		description?: string,
		isRequired?: boolean,
		initialData?: ReferenceData,
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

		this.reference = reference;
		this.isMultipleSelect = isMultipleSelect;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			reference: this.reference,
			isMultipleSelect: this.isMultipleSelect || false,
			params: JSON.parse(
				JSON.stringify({
					isMultipleSelect: this.isMultipleSelect || false,
					reference: this.reference,
				})
			),
		};
	}

}
