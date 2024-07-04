import {
	NgModule
} from '@angular/core';
import {
	A11yModule
} from '@angular/cdk/a11y';

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
	CUBEditorModule
} from '@cub/material/editor';
import {
	CUBExpansionPanelModule
} from '@cub/material/expansion-panel';
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
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';

import {
	LogicEditorModule
} from '@main/common/logic-editor/logic-editor.module';

import {
	BuilderSharedModule
} from '../../modules/builder/builder.shared.module';
import {
	CurrencyValuePipe,
	DateValuePipe,
	FieldMetadataPipe,
	IsDateFieldPipe,
	IsNumberFieldPipe,
	IsTextFieldPipe,
	NumberValuePipe
} from '../../pipes';

import {
	AttachmentFieldInputComponent,
	CheckboxFieldInputComponent,
	CurrencyFieldInputComponent,
	DateFieldInputComponent,
	DropdownFieldInputComponent,
	EmailFieldInputComponent,
	LinkFieldInputComponent,
	NumberFieldInputComponent,
	ParagraphFieldInputComponent,
	PhoneFieldInputComponent,
	ProgressFieldInputComponent,
	RatingFieldInputComponent,
	TextFieldInputComponent,
	FormulaFieldInputComponent,
	PeopleFieldInputComponent,
	FieldInputFactoryDirective,
	FieldInputGroupDirective,
	ReferenceFieldInputComponent,
	LastModifiedByFieldInputComponent,
	CreatedByFieldInputComponent,
	LastModifiedTimeFieldInputComponent,
	CreatedTimeFieldInputComponent
} from './components';

@NgModule({
	imports: [
		A11yModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule
		.forChild({
			prefix: 'FIELD.INPUT',
			loader: ( lang: string ) => {
				return import(
					`./i18n/${lang}.json`
				);
			},
		}),

		CUBButtonModule,
		CUBCheckboxModule,
		CUBDatePickerModule,
		CUBDropdownModule,
		CUBEditorModule,
		CUBExpansionPanelModule,
		CUBFilePickerModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBMenuModule,
		CUBPhoneFieldModule,
		CUBPopupModule,
		CUBRatingModule,
		CUBSliderModule,
		CUBMemberPickerModule,
		CUBTooltipModule,
		CUBChipModule,
		CUBScrollBarModule,
		CUBSearchBoxModule,
		CUBDividerModule,

		LogicEditorModule,

		BuilderSharedModule,

		IsDateFieldPipe,
		IsNumberFieldPipe,
		IsTextFieldPipe,

		CurrencyValuePipe,
		DateValuePipe,
		FieldMetadataPipe,
		NumberValuePipe,
	],
	exports: [
		AttachmentFieldInputComponent,
		CheckboxFieldInputComponent,
		CurrencyFieldInputComponent,
		DateFieldInputComponent,
		DropdownFieldInputComponent,
		EmailFieldInputComponent,
		LinkFieldInputComponent,
		NumberFieldInputComponent,
		ParagraphFieldInputComponent,
		PhoneFieldInputComponent,
		ProgressFieldInputComponent,
		RatingFieldInputComponent,
		TextFieldInputComponent,
		FormulaFieldInputComponent,
		PeopleFieldInputComponent,
		ReferenceFieldInputComponent,
		LastModifiedByFieldInputComponent,
		LastModifiedTimeFieldInputComponent,
		CreatedByFieldInputComponent,
		CreatedTimeFieldInputComponent,
		FieldInputFactoryDirective,
		FieldInputGroupDirective,
	],
	declarations: [
		AttachmentFieldInputComponent,
		CheckboxFieldInputComponent,
		CurrencyFieldInputComponent,
		DateFieldInputComponent,
		DropdownFieldInputComponent,
		EmailFieldInputComponent,
		LinkFieldInputComponent,
		NumberFieldInputComponent,
		ParagraphFieldInputComponent,
		PhoneFieldInputComponent,
		ProgressFieldInputComponent,
		RatingFieldInputComponent,
		TextFieldInputComponent,
		FormulaFieldInputComponent,
		PeopleFieldInputComponent,
		ReferenceFieldInputComponent,
		LastModifiedByFieldInputComponent,
		LastModifiedTimeFieldInputComponent,
		CreatedByFieldInputComponent,
		CreatedTimeFieldInputComponent,
		FieldInputFactoryDirective,
		FieldInputGroupDirective,
	],
	providers: [],
})
export class InputModule {}
