import {
	NgModule
} from '@angular/core';
import {
	DragDropModule
} from '@angular/cdk/drag-drop';
import {
	ScrollingModule
} from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBDatePickerModule
} from '@cub/material/date-picker';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBEditorModule
} from '@cub/material/editor';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';

import {
	FieldMetadataPipe,
	DateValuePipe
} from '../../pipes';

import {
	ComparisonComponent,

	AttachmentComparisonComponent,
	CheckboxComparisonComponent,
	CreatedByComparisonComponent,
	CreatedTimeComparisonComponent,
	CurrencyComparisonComponent,
	DateComparisonComponent,
	DropdownComparisonComponent,
	EmailComparisonComponent,
	FormulaComparisonComponent,
	LastModifiedByComparisonComponent,
	LastModifiedTimeComparisonComponent,
	LookupComparisonComponent,
	NumberComparisonComponent,
	ParagraphComparisonComponent,
	PeopleComparisonComponent,
	PhoneComparisonComponent,
	ProgressComparisonComponent,
	RatingComparisonComponent,
	ReferenceComparisonComponent,
	TextComparisonComponent,
	TextOperatorNamePipe,
	LinkComparisonComponent,

	TypeTranslatePipe,
	PrefixTranslatePipe
} from './components';
import {
	OtherFieldsPipe
} from './pipes';

@NgModule({
	imports: [
		DragDropModule,
		ScrollingModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'FIELD.COMPARISON',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBCheckboxModule,
		CUBDatePickerModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBMemberPickerModule,
		CUBMenuModule,
		CUBEditorModule,
		CUBPopupModule,
		CUBDividerModule,
		CUBSearchBoxModule,
		CUBScrollBarModule,

		FieldMetadataPipe,
		DateValuePipe,
	],
	exports: [
		ComparisonComponent,
	],
	declarations: [
		AttachmentComparisonComponent,
		CheckboxComparisonComponent,
		CreatedByComparisonComponent,
		CreatedTimeComparisonComponent,
		CurrencyComparisonComponent,
		DateComparisonComponent,
		DropdownComparisonComponent,
		EmailComparisonComponent,
		FormulaComparisonComponent,
		LastModifiedByComparisonComponent,
		LastModifiedTimeComparisonComponent,
		LookupComparisonComponent,
		NumberComparisonComponent,
		ParagraphComparisonComponent,
		PeopleComparisonComponent,
		PhoneComparisonComponent,
		ProgressComparisonComponent,
		RatingComparisonComponent,
		ReferenceComparisonComponent,
		TextComparisonComponent,
		LinkComparisonComponent,

		ComparisonComponent,

		TypeTranslatePipe,
		PrefixTranslatePipe,
		OtherFieldsPipe,
		TextOperatorNamePipe,
	],
	providers: [],
})
export class ComparisonModule {}
