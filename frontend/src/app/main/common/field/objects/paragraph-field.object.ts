import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	IParagraphField,
	ParagraphData
} from '../interfaces';

import { Field } from './field.object';

export class ParagraphField
	extends Field<ParagraphData>
	implements IParagraphField {

	public static readonly dataType: DataType
		= DataType.Paragraph;

	public isRichTextFormatting: boolean;

	get dataType(): DataType {
		return ParagraphField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {ParagraphData=} data
	 * @param {boolean=} isRichTextFormatting
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {ParagraphData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: ParagraphData,
		isRichTextFormatting?: boolean,
		description?: string,
		isRequired?: boolean,
		initialData?: ParagraphData,
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

		this.isRichTextFormatting = isRichTextFormatting;
	}

	/**
	 * @param {string} text
	 * @return {ParagraphData}
	 */
	public override convertTextToData(
		text: string
	): ParagraphData {
		let data: ParagraphData;

		if ( text ) {
			data = { text };
		}

		if ( this.validate( data ) !== null ) {
			return;
		}

		return data;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			isRichTextFormatting: this.isRichTextFormatting,
			params: JSON.parse(
				JSON.stringify({
					isRichTextFormatting: this.isRichTextFormatting,
				})
			),
		};
	}

	/**
	 * @param {ParagraphData=} data
	 * @return {string}
	 */
	public override toString(
		data: ParagraphData = this.data
	): string {
		return data?.text;
	}

}
