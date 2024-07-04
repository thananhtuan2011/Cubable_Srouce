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
	ResizableModule
} from 'angular-resizable-element';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBActionBoxModule
} from '@cub/material/action-box';
import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBDatePickerModule
} from '@cub/material/date-picker';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBEmojiPickerModule
} from '@cub/material/emoji-picker';
import {
	CUBFilePickerModule
} from '@cub/material/file-picker';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBPhoneFieldModule
} from '@cub/material/phone-field';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBRatingModule
} from '@cub/material/rating';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBToastModule
} from '@cub/material/toast';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBClipboardCopyModule
} from '@cub/material/clipboard-copy';


import {
	FieldModule
} from '@main/common/field/field.module';

import {
	AttachmentFieldCellFullComponent,
	AttachmentFieldCellLiteComponent,

	CheckboxFieldCellFullComponent,
	CheckboxFieldCellLiteComponent,
	CreatedByFieldCellLiteComponent,

	CreatedTimeFieldCellLiteComponent,

	CurrencyFieldCellFullComponent,
	CurrencyFieldCellLiteComponent,

	DateFieldCellFullComponent,
	DateFieldCellLiteComponent,
	DatePickerComponent,

	DropdownFieldCellFullComponent,
	DropdownFieldCellLiteComponent,
	DropdownExpanderComponent,
	DropdownSelectorComponent,

	EmailFieldCellFullComponent,
	EmailFieldCellLiteComponent,

	FormulaFieldCellFullComponent,
	FormulaFieldCellLiteComponent,

	LastModifiedByFieldCellLiteComponent,

	LastModifiedTimeFieldCellLiteComponent,

	LinkFieldCellFullComponent,
	LinkFieldCellLiteComponent,

	NumberFieldCellFullComponent,
	NumberFieldCellLiteComponent,

	ParagraphFieldCellFullComponent,
	ParagraphFieldCellLiteComponent,

	PeopleFieldCellFullComponent,
	PeopleFieldCellLiteComponent,
	PeopleOptionPickerComponent,
	PeoplePopupComponent,

	PhoneFieldCellFullComponent,
	PhoneFieldCellLiteComponent,

	ProgressFieldCellFullComponent,
	ProgressFieldCellLiteComponent,

	RatingFieldCellFullComponent,
	RatingFieldCellLiteComponent,

	ReferenceExpanderComponent,

	ReferenceFieldCellFullComponent,
	ReferenceFieldCellLiteComponent,

	TextFieldCellFullComponent,
	TextFieldCellLiteComponent,

	LookupFieldCellFullComponent,

	FieldCellFactoryDirective,
	InputBoxComponent,

	SpreadsheetComponent,

	GroupVirtualScrollViewportComponent,
	VirtualScrollComponent,
	LookupFieldCellLiteComponent
} from './components';

import {
	CalculatingResultPipe,
	CalculatingTypesPipe,
	SortingTypeLabel
} from './pipes';

@NgModule({
	imports: [
		DragDropModule,
		ResizableModule,
		ScrollingModule,

		CoreModule,
		FormModule,
		I18nLazyTranslateModule.forChild({
			prefix: 'SPREADSHEET',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBActionBoxModule,
		CUBAvatarModule,
		CUBButtonModule,
		CUBCheckboxModule,
		CUBChipModule,
		CUBDatePickerModule,
		CUBEmojiPickerModule,
		CUBFilePickerModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBLoadingModule,
		CUBMemberPickerModule,
		CUBMenuModule,
		CUBPhoneFieldModule,
		CUBPopupModule,
		CUBRatingModule,
		CUBScrollBarModule,
		CUBSearchBoxModule,
		CUBSliderModule,
		CUBToastModule,
		CUBTooltipModule,
		CUBDropdownModule,
		CUBAvatarModule,
		CUBMemberPickerModule,
		CUBLoadingModule,
		CUBSwitchModule,
		CUBImageModule,
		CUBClipboardCopyModule,

		FieldModule,

		CalculatingResultPipe,
		CalculatingTypesPipe,
		SortingTypeLabel,
	],
	exports: [
		SpreadsheetComponent,

		SortingTypeLabel,
	],
	declarations: [
		AttachmentFieldCellFullComponent,
		AttachmentFieldCellLiteComponent,

		CheckboxFieldCellFullComponent,
		CheckboxFieldCellLiteComponent,
		CreatedByFieldCellLiteComponent,

		CreatedTimeFieldCellLiteComponent,

		CurrencyFieldCellFullComponent,
		CurrencyFieldCellLiteComponent,

		DateFieldCellFullComponent,
		DateFieldCellLiteComponent,
		DatePickerComponent,

		DropdownFieldCellFullComponent,
		DropdownFieldCellLiteComponent,
		DropdownExpanderComponent,
		DropdownSelectorComponent,

		EmailFieldCellFullComponent,
		EmailFieldCellLiteComponent,

		FormulaFieldCellFullComponent,
		FormulaFieldCellLiteComponent,

		LastModifiedByFieldCellLiteComponent,

		LastModifiedTimeFieldCellLiteComponent,

		LinkFieldCellFullComponent,
		LinkFieldCellLiteComponent,

		NumberFieldCellFullComponent,
		NumberFieldCellLiteComponent,

		ParagraphFieldCellFullComponent,
		ParagraphFieldCellLiteComponent,

		PeopleFieldCellFullComponent,
		PeopleFieldCellLiteComponent,
		PeopleOptionPickerComponent,
		PeopleOptionPickerComponent,
		PeoplePopupComponent,
		PeoplePopupComponent,

		PhoneFieldCellFullComponent,
		PhoneFieldCellLiteComponent,

		ProgressFieldCellFullComponent,
		ProgressFieldCellLiteComponent,

		RatingFieldCellFullComponent,
		RatingFieldCellLiteComponent,

		ReferenceFieldCellFullComponent,
		ReferenceFieldCellLiteComponent,
		ReferenceExpanderComponent,

		TextFieldCellFullComponent,
		TextFieldCellLiteComponent,

		LookupFieldCellFullComponent,
		LookupFieldCellLiteComponent,

		FieldCellFactoryDirective,
		InputBoxComponent,

		SpreadsheetComponent,

		GroupVirtualScrollViewportComponent,
		VirtualScrollComponent,
	],
	providers: [],
})
export class SpreadsheetModule {}
