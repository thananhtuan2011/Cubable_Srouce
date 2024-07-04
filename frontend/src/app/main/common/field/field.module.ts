import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';

import {
	BuilderModule
} from './modules/builder/builder.module';
import {
	EditorModule
} from './modules/editor/editor.module';
import {
	InputModule
} from './modules/input/input.module';
import {
	FieldMenuComponent,
	FieldMenuDirective
} from './components';
import {
	FieldMenuService
} from './services';
import {
	FieldMetadataPipe,

	IsAttachmentFieldPipe,
	IsCheckboxFieldPipe,
	IsCreatedByFieldPipe,
	IsCreatedTimeFieldPipe,
	IsCurrencyFieldPipe,
	IsDateFieldPipe,
	IsDropdownFieldPipe,
	IsEmailFieldPipe,
	IsFormulaFieldPipe,
	IsLastModifiedByFieldPipe,
	IsLastModifiedTimeFieldPipe,
	IsLinkFieldPipe,
	IsLookupFieldPipe,
	IsNumberFieldPipe,
	IsParagraphFieldPipe,
	IsPeopleFieldPipe,
	IsPhoneFieldPipe,
	IsProgressFieldPipe,
	IsRatingFieldPipe,
	IsReferenceFieldPipe,
	IsTextFieldPipe,

	CurrencyValuePipe,
	DateValuePipe,
	NumberValuePipe
} from './pipes';
import {
	EventHelper
} from './helpers';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'FIELD',
			loader: ( lang: string ) => {
				return import( `./i18n/${lang}.json` );
			},
		}),

		CUBImageModule,
		CUBMenuModule,
		CUBSearchBoxModule,
		CUBTooltipModule,

		BuilderModule,
		EditorModule,
		InputModule,

		FieldMetadataPipe,

		IsAttachmentFieldPipe,
		IsCheckboxFieldPipe,
		IsCreatedByFieldPipe,
		IsCreatedTimeFieldPipe,
		IsCurrencyFieldPipe,
		IsDateFieldPipe,
		IsDropdownFieldPipe,
		IsEmailFieldPipe,
		IsFormulaFieldPipe,
		IsLastModifiedByFieldPipe,
		IsLastModifiedTimeFieldPipe,
		IsLinkFieldPipe,
		IsLookupFieldPipe,
		IsNumberFieldPipe,
		IsParagraphFieldPipe,
		IsPeopleFieldPipe,
		IsPhoneFieldPipe,
		IsProgressFieldPipe,
		IsRatingFieldPipe,
		IsReferenceFieldPipe,
		IsTextFieldPipe,

		CurrencyValuePipe,
		DateValuePipe,
		NumberValuePipe,
	],
	exports: [
		EditorModule,
		InputModule,

		FieldMenuDirective,

		FieldMetadataPipe,

		IsAttachmentFieldPipe,
		IsCheckboxFieldPipe,
		IsCreatedByFieldPipe,
		IsCreatedTimeFieldPipe,
		IsCurrencyFieldPipe,
		IsDateFieldPipe,
		IsDropdownFieldPipe,
		IsEmailFieldPipe,
		IsFormulaFieldPipe,
		IsLastModifiedByFieldPipe,
		IsLastModifiedTimeFieldPipe,
		IsLinkFieldPipe,
		IsLookupFieldPipe,
		IsNumberFieldPipe,
		IsParagraphFieldPipe,
		IsPeopleFieldPipe,
		IsPhoneFieldPipe,
		IsProgressFieldPipe,
		IsRatingFieldPipe,
		IsReferenceFieldPipe,
		IsTextFieldPipe,

		CurrencyValuePipe,
		DateValuePipe,
		NumberValuePipe,
	],
	declarations: [
		FieldMenuComponent,
		FieldMenuDirective,
	],
	providers: [
		FieldMenuService,
		EventHelper,
	],
})
export class FieldModule {}
