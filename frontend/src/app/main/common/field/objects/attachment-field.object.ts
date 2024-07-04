import {
	AttachmentData,
	DataType,
	FieldExtra,
	IAttachmentField
} from '../interfaces';

import { Field } from './field.object';

export class AttachmentField
	extends Field<AttachmentData>
	implements IAttachmentField {

	public static readonly dataType: DataType
		= DataType.Attachment;

	get dataType(): DataType {
		return AttachmentField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {AttachmentData=} data
	 * @param {string=} description
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: AttachmentData,
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
