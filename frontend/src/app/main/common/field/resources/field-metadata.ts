import {
	DataType
} from '../interfaces';

export type FieldMetadata = {
	icon: string;
	label: string;
	description: string;
	avatar: string;
	image: string;
};

export const FIELD_METADATA: ReadonlyMap<
	DataType,
	FieldMetadata
> = new Map([
	[
		DataType.Attachment,
		{
			icon: 'paperclip',
			label: 'FIELD.METADATA.LABEL.ATTACHMENT',
			description: 'FIELD.METADATA.DESCRIPTION.ATTACHMENT',
			avatar: 'assets/images/field/avatars/attachment.svg',
			image: 'assets/images/field/images/attachment.webp',
		},
	],
	[
		DataType.Checkbox,
		{
			icon: 'checkbox',
			label: 'FIELD.METADATA.LABEL.CHECKBOX',
			description: 'FIELD.METADATA.DESCRIPTION.CHECKBOX',
			avatar: 'assets/images/field/avatars/checkbox.svg',
			image: 'assets/images/field/images/checkbox.webp',
		},
	],
	[
		DataType.CreatedBy,
		{
			icon: 'user-clock',
			label: 'FIELD.METADATA.LABEL.CREATED_BY',
			description: 'FIELD.METADATA.DESCRIPTION.CREATED_BY',
			avatar: 'assets/images/field/avatars/created-by.svg',
			image: 'assets/images/field/images/created-by.webp',
		},
	],
	[
		DataType.CreatedTime,
		{
			icon: 'calendar-clock-fill',
			label: 'FIELD.METADATA.LABEL.CREATED_TIME',
			description: 'FIELD.METADATA.DESCRIPTION.CREATED_TIME',
			avatar: 'assets/images/field/avatars/created-time.svg',
			image: 'assets/images/field/images/created-time.webp',
		},
	],
	[
		DataType.Currency,
		{
			icon: 'currency',
			label: 'FIELD.METADATA.LABEL.CURRENCY',
			description: 'FIELD.METADATA.DESCRIPTION.CURRENCY',
			avatar: 'assets/images/field/avatars/currency.svg',
			image: 'assets/images/field/images/currency.webp',
		},
	],
	[
		DataType.Dropdown,
		{
			icon: 'dropdown-circle',
			label: 'FIELD.METADATA.LABEL.DROPDOWN',
			description: 'FIELD.METADATA.DESCRIPTION.DROPDOWN',
			avatar: 'assets/images/field/avatars/dropdown.svg',
			image: 'assets/images/field/images/dropdown.webp',
		},
	],
	[
		DataType.Date,
		{
			icon: 'calendar-fill',
			label: 'FIELD.METADATA.LABEL.DATE',
			description: 'FIELD.METADATA.DESCRIPTION.DATE',
			avatar: 'assets/images/field/avatars/date.svg',
			image: 'assets/images/field/images/date.webp',
		},
	],
	[
		DataType.Email,
		{
			icon: 'mail',
			label: 'FIELD.METADATA.LABEL.EMAIL',
			description: 'FIELD.METADATA.DESCRIPTION.EMAIL',
			avatar: 'assets/images/field/avatars/email.svg',
			image: 'assets/images/field/images/email.webp',
		},
	],
	[
		DataType.Formula,
		{
			icon: 'formula',
			label: 'FIELD.METADATA.LABEL.FORMULA',
			description: 'FIELD.METADATA.DESCRIPTION.FORMULA',
			avatar: 'assets/images/field/avatars/formula.svg',
			image: 'assets/images/field/images/formula.webp',
		},
	],
	[
		DataType.LastModifiedBy,
		{
			icon: 'user-clock',
			label: 'FIELD.METADATA.LABEL.LAST_MODIFIED_BY',
			description: 'FIELD.METADATA.DESCRIPTION.LAST_MODIFIED_BY',
			avatar: 'assets/images/field/avatars/last-modified-by.svg',
			image: 'assets/images/field/images/last-modified-by.webp',
		},
	],
	[
		DataType.LastModifiedTime,
		{
			icon: 'calendar-clock-fill',
			label: 'FIELD.METADATA.LABEL.LAST_MODIFIED_TIME',
			description: 'FIELD.METADATA.DESCRIPTION.LAST_MODIFIED_TIME',
			avatar: 'assets/images/field/avatars/last-modified-time.svg',
			image: 'assets/images/field/images/last-modified-time.webp',
		},
	],
	[
		DataType.Link,
		{
			icon: 'link',
			label: 'FIELD.METADATA.LABEL.LINK',
			description: 'FIELD.METADATA.DESCRIPTION.LINK',
			avatar: 'assets/images/field/avatars/link.svg',
			image: 'assets/images/field/images/link.webp',
		},
	],
	[
		DataType.Lookup,
		{
			icon: 'search',
			label: 'FIELD.METADATA.LABEL.LOOKUP',
			description: 'FIELD.METADATA.DESCRIPTION.LOOKUP',
			avatar: 'assets/images/field/avatars/lookup.svg',
			image: 'assets/images/field/images/lookup.webp',
		},
	],
	[
		DataType.Number,
		{
			icon: 'number',
			label: 'FIELD.METADATA.LABEL.NUMBER',
			description: 'FIELD.METADATA.DESCRIPTION.NUMBER',
			avatar: 'assets/images/field/avatars/number.svg',
			image: 'assets/images/field/images/number.webp',
		},
	],
	[
		DataType.Paragraph,
		{
			icon: 'long-text',
			label: 'FIELD.METADATA.LABEL.PARAGRAPH',
			description: 'FIELD.METADATA.DESCRIPTION.PARAGRAPH',
			avatar: 'assets/images/field/avatars/paragraph.svg',
			image: 'assets/images/field/images/paragraph.webp',
		},
	],
	[
		DataType.People,
		{
			icon: 'user',
			label: 'FIELD.METADATA.LABEL.PEOPLE',
			description: 'FIELD.METADATA.DESCRIPTION.PEOPLE',
			avatar: 'assets/images/field/avatars/people.svg',
			image: 'assets/images/field/images/people.webp',
		},
	],
	[
		DataType.Phone,
		{
			icon: 'phone',
			label: 'FIELD.METADATA.LABEL.PHONE',
			description: 'FIELD.METADATA.DESCRIPTION.PHONE',
			avatar: 'assets/images/field/avatars/phone.svg',
			image: 'assets/images/field/images/phone.webp',
		},
	],
	[
		DataType.Progress,
		{
			icon: 'progress',
			label: 'FIELD.METADATA.LABEL.PROGRESS',
			description: 'FIELD.METADATA.DESCRIPTION.PROGRESS',
			avatar: 'assets/images/field/avatars/progress.svg',
			image: 'assets/images/field/images/progress.webp',
		},
	],
	[
		DataType.Rating,
		{
			icon: 'star',
			label: 'FIELD.METADATA.LABEL.RATING',
			description: 'FIELD.METADATA.DESCRIPTION.RATING',
			avatar: 'assets/images/field/avatars/rating.svg',
			image: 'assets/images/field/images/rating.webp',
		},
	],
	[
		DataType.Reference,
		{
			icon: 'reference',
			label: 'FIELD.METADATA.LABEL.REFERENCE',
			description: 'FIELD.METADATA.DESCRIPTION.REFERENCE',
			avatar: 'assets/images/field/avatars/reference.svg',
			image: 'assets/images/field/images/reference.webp',
		},
	],
	[
		DataType.Text,
		{
			icon: 'text',
			label: 'FIELD.METADATA.LABEL.TEXT',
			description: 'FIELD.METADATA.DESCRIPTION.TEXT',
			avatar: 'assets/images/field/avatars/text.svg',
			image: 'assets/images/field/images/text.webp',
		},
	],
]);
