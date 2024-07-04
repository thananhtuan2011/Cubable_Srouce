import {
	DataType
} from '../interfaces';
import {
	AttachmentField,
	CheckboxField,
	CreatedByField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	Field,
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LinkField,
	LookupField,
	NumberField,
	ParagraphField,
	PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	ReferenceField,
	TextField
} from '../objects';

export type FieldType = {
	object: Field;
	args: string[];
};

export const FIELD_TYPES: ReadonlyMap<
	DataType,
	FieldType
> = new Map([
	[
		DataType.Attachment,
		{
			object: AttachmentField,
			args: [],
		} as any,
	],
	[
		DataType.Checkbox,
		{
			object: CheckboxField,
			args: [],
		},
	],
	[
		DataType.CreatedBy,
		{
			object: CreatedByField,
			args: [],
		},
	],
	[
		DataType.CreatedTime,
		{
			object: CreatedTimeField,
			args: [
				'format',
				'timeFormat',
			],
		},
	],
	[
		DataType.Currency,
		{
			object: CurrencyField,
			args: [
				'currency',
				'format',
				'decimalPlaces',
				'allowNegative',
			],
		},
	],
	[
		DataType.Date,
		{
			object: DateField,
			args: [
				'format',
				'timeFormat',
			],
		},
	],
	[
		DataType.Dropdown,
		{
			object: DropdownField,
			args: [
				'options',
				'reference',
				'isMultipleSelect',
				'allowAddSelections',
			],
		},
	],
	[
		DataType.Email,
		{
			object: EmailField,
			args: [],
		},
	],
	[
		DataType.Formula,
		{
			object: FormulaField,
			args: [],
		},
	],
	[
		DataType.LastModifiedBy,
		{
			object: LastModifiedByField,
			args: [
				'targetFieldID',
			],
		},
	],
	[
		DataType.LastModifiedTime,
		{
			object: LastModifiedTimeField,
			args: [
				'format',
				'timeFormat',
				'targetFieldID',
			],
		},
	],
	[
		DataType.Number,
		{
			object: NumberField,
			args: [
				'format',
				'decimalPlaces',
				'allowNegative',
			],
		},
	],
	[
		DataType.Paragraph,
		{
			object: ParagraphField,
			args: [
				'isRichTextFormatting',
			],
		},
	],
	[
		DataType.Phone,
		{
			object: PhoneField,
			args: [
				'countryCode',
			],
		},
	],
	[
		DataType.Progress,
		{
			object: ProgressField,
			args: [
				'isAuto',
				'startValue',
				'endValue',
			],
		},
	],
	[
		DataType.Rating,
		{
			object: RatingField,
			args: [
				'maxPoint',
				'emojiType',
			],
		},
	],
	[
		DataType.Reference,
		{
			object: ReferenceField,
			args: [
				'reference',
				'isMultipleSelect',
			],
		},
	],
	[
		DataType.Text,
		{
			object: TextField,
			args: [],
		},
	],
	[
		DataType.Link,
		{
			object: LinkField,
			args: [],
		},
	],
	[
		DataType.People,
		{
			object: PeopleField,
			args: [
				'people',
				'includeSetting',
				'excludeSetting',
				'isMultipleSelect',
				'isNotifyAdded',
			],
		},
	],
	[
		DataType.Lookup,
		{
			object: LookupField,
			args: [
				'lookup',
			],
		},
	],
]);
