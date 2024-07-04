import {
	Type
} from '@angular/core';
import _ from 'lodash';

import {
	DataType
} from '@main/common/field/interfaces';

import {
	FieldCell
} from './field-cell';
import {
	AttachmentFieldCellFullComponent
} from './attachment/cell-full.component';
import {
	AttachmentFieldCellLiteComponent
} from './attachment/cell-lite.component';
import {
	CheckboxFieldCellFullComponent
} from './checkbox/cell-full.component';
import {
	CheckboxFieldCellLiteComponent
} from './checkbox/cell-lite.component';
import {
	CreatedTimeFieldCellLiteComponent
} from './created-time/cell-lite.component';
import {
	CurrencyFieldCellFullComponent
} from './currency/cell-full.component';
import {
	CurrencyFieldCellLiteComponent
} from './currency/cell-lite.component';
import {
	DateFieldCellFullComponent
} from './date/cell-full.component';
import {
	DateFieldCellLiteComponent
} from './date/cell-lite.component';
import {
	EmailFieldCellFullComponent
} from './email/cell-full.component';
import {
	EmailFieldCellLiteComponent
} from './email/cell-lite.component';
import {
	LastModifiedTimeFieldCellLiteComponent
} from './last-modified-time/cell-lite.component';
import {
	LinkFieldCellFullComponent
} from './link/cell-full.component';
import {
	LinkFieldCellLiteComponent
} from './link/cell-lite.component';
import {
	NumberFieldCellFullComponent
} from './number/cell-full.component';
import {
	NumberFieldCellLiteComponent
} from './number/cell-lite.component';
import {
	ParagraphFieldCellFullComponent
} from './paragraph/cell-full.component';
import {
	ParagraphFieldCellLiteComponent
} from './paragraph/cell-lite.component';
import {
	PhoneFieldCellFullComponent
} from './phone/cell-full.component';
import {
	PhoneFieldCellLiteComponent
} from './phone/cell-lite.component';
import {
	ProgressFieldCellFullComponent
} from './progress/cell-full.component';
import {
	ProgressFieldCellLiteComponent
} from './progress/cell-lite.component';
import {
	RatingFieldCellFullComponent
} from './rating/cell-full.component';
import {
	RatingFieldCellLiteComponent
} from './rating/cell-lite.component';
import {
	TextFieldCellFullComponent
} from './text/cell-full.component';
import {
	TextFieldCellLiteComponent
} from './text/cell-lite.component';
import {
	DropdownFieldCellFullComponent
} from './dropdown/cell-full.component';
import {
	DropdownFieldCellLiteComponent
} from './dropdown/cell-lite.component';
import {
	CreatedByFieldCellLiteComponent
} from './created-by/cell-lite.component';
import {
	LastModifiedByFieldCellLiteComponent
} from './last-modified-by/cell-lite.component';
import {
	PeopleFieldCellFullComponent
} from './people/cell-full.component';
import {
	PeopleFieldCellLiteComponent
} from './people/cell-lite.component';
import {
	ReferenceFieldCellFullComponent
} from './reference/cell-full.component';
import {
	ReferenceFieldCellLiteComponent
} from './reference/cell-lite.component';
import {
	LookupFieldCellFullComponent
} from './lookup/cell-full.component';
import {
	LookupFieldCellLiteComponent
} from './lookup/cell-lite.component';
import {
	FormulaFieldCellFullComponent
} from './formula/cell-full.component';
import {
	FormulaFieldCellLiteComponent
} from './formula/cell-lite.component';

export type CmpType = Type<FieldCell>;
export type CmpVariant = {
	lite: CmpType | [ CmpType, boolean ];
	full: CmpType;
};

const FIELD_CELL_CMP_VARIANT_MAP: ReadonlyMap<
	DataType,
	CmpVariant
> = new Map([
	[
		DataType.Attachment,
		{
			lite: AttachmentFieldCellLiteComponent,
			full: AttachmentFieldCellFullComponent,
		} as any,
	],
	[
		DataType.Checkbox,
		{
			lite: [ CheckboxFieldCellLiteComponent, true ],
			full: CheckboxFieldCellFullComponent,
		},
	],
	[
		DataType.CreatedTime,
		{
			lite: CreatedTimeFieldCellLiteComponent,
		},
	],
	[
		DataType.Currency,
		{
			lite: CurrencyFieldCellLiteComponent,
			full: CurrencyFieldCellFullComponent,
		},
	],
	[
		DataType.Date,
		{
			lite: DateFieldCellLiteComponent,
			full: DateFieldCellFullComponent,
		},
	],
	[
		DataType.Email,
		{
			lite: EmailFieldCellLiteComponent,
			full: EmailFieldCellFullComponent,
		},
	],
	[
		DataType.LastModifiedTime,
		{
			lite: LastModifiedTimeFieldCellLiteComponent,
		},
	],
	[
		DataType.Link,
		{
			lite: LinkFieldCellLiteComponent,
			full: LinkFieldCellFullComponent,
		},
	],
	[
		DataType.Number,
		{
			lite: NumberFieldCellLiteComponent,
			full: NumberFieldCellFullComponent,
		},
	],
	[
		DataType.Paragraph,
		{
			lite: ParagraphFieldCellLiteComponent,
			full: ParagraphFieldCellFullComponent,
		},
	],
	[
		DataType.Phone,
		{
			lite: PhoneFieldCellLiteComponent,
			full: PhoneFieldCellFullComponent,
		},
	],
	[
		DataType.Progress,
		{
			lite: [ ProgressFieldCellLiteComponent, true ],
			full: ProgressFieldCellFullComponent,
		},
	],
	[
		DataType.Rating,
		{
			lite: [ RatingFieldCellLiteComponent, true ],
			full: RatingFieldCellFullComponent,
		},
	],
	[
		DataType.Text,
		{
			lite: TextFieldCellLiteComponent,
			full: TextFieldCellFullComponent,
		},
	],
	[
		DataType.Dropdown,
		{
			lite: DropdownFieldCellLiteComponent,
			full: DropdownFieldCellFullComponent,
		},
	],
	[
		DataType.CreatedBy,
		{
			lite: CreatedByFieldCellLiteComponent,
		},
	],
	[
		DataType.LastModifiedBy,
		{
			lite: LastModifiedByFieldCellLiteComponent,
		},
	],
	[
		DataType.People,
		{
			lite: PeopleFieldCellLiteComponent,
			full: PeopleFieldCellFullComponent,
		},
	],
	[
		DataType.Reference,
		{
			lite: ReferenceFieldCellLiteComponent,
			full: ReferenceFieldCellFullComponent,
		},
	],
	[
		DataType.Lookup,
		{
			lite: LookupFieldCellLiteComponent,
			full: LookupFieldCellFullComponent,
		},
	],
	[
		DataType.Formula,
		{
			lite: FormulaFieldCellLiteComponent,
			full: FormulaFieldCellFullComponent,
		},
	],
]);

// eslint-disable-next-line @typescript-eslint/typedef
export const getCmpVariant = _.memoize(
	function( dataType: DataType ): CmpVariant {
		return FIELD_CELL_CMP_VARIANT_MAP.get( dataType );
	}
);
