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
	CUBCardModule
} from '@cub/material/card';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBColorPickerModule
} from '@cub/material/color-picker';
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
	CUBImageModule
} from '@cub/material/image';
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
	CUBRadioModule
} from '@cub/material/radio';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBTabsModule
} from '@cub/material/tabs';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBDividerModule
} from '@cub/material/divider';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	RecordService
} from '@main/workspace/modules/base/modules/board/modules/record/services';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';
import {
	CommonModule
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/common/common.module';

import {
	EditorModule
} from '../../modules/editor/editor.module';
import {
	InputModule
} from '../../modules/input/input.module';
import {
	CurrencyValuePipe,
	DateValuePipe,
	FieldMetadataPipe,
	NumberValuePipe
} from '../../pipes';

import {
	BuilderSharedModule
} from './builder.shared.module';
import {
	FieldBuilderDirective,

	AttachmentFieldBuilderComponent,
	CheckboxFieldBuilderComponent,
	CreatedByFieldBuilderComponent,
	CreatedTimeFieldBuilderComponent,
	CurrencyFieldBuilderComponent,
	DateFieldBuilderComponent,
	DropdownFieldBuilderComponent,
	EmailFieldBuilderComponent,
	FormulaFieldBuilderComponent,
	LastModifiedByFieldBuilderComponent,
	LastModifiedTimeFieldBuilderComponent,
	LinkFieldBuilderComponent,
	LookupFieldBuilderComponent,
	NumberFieldBuilderComponent,
	ParagraphFieldBuilderComponent,
	PeopleFieldBuilderComponent,
	PhoneFieldBuilderComponent,
	ProgressFieldBuilderComponent,
	RatingFieldBuilderComponent,
	ReferenceFieldBuilderComponent,
	TextFieldBuilderComponent
} from './components';
import {
	FieldBuilderService
} from './services';

@NgModule({
	imports: [
		DragDropModule,
		ScrollingModule,

		CoreModule,
		FormModule,
		CommonModule,

		I18nLazyTranslateModule
		.forChild({
			prefix: 'FIELD.BUILDER',
			loader: ( lang: string ) => {
				return import(
					`./i18n/${lang}.json`
				);
			},
		}),

		CUBButtonModule,
		CUBCardModule,
		CUBCheckboxModule,
		CUBColorPickerModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBImageModule,
		CUBMemberPickerModule,
		CUBMenuModule,
		CUBPhoneFieldModule,
		CUBPopupModule,
		CUBRadioModule,
		CUBScrollBarModule,
		CUBSearchBoxModule,
		CUBSwitchModule,
		CUBTabsModule,
		CUBTooltipModule,
		CUBLoadingModule,
		CUBDividerModule,

		EditorModule,
		InputModule,

		CurrencyValuePipe,
		DateValuePipe,
		FieldMetadataPipe,
		NumberValuePipe,

		BuilderSharedModule,
	],
	exports: [
		FieldBuilderDirective,
	],
	declarations: [
		FieldBuilderDirective,

		AttachmentFieldBuilderComponent,
		CheckboxFieldBuilderComponent,
		CreatedByFieldBuilderComponent,
		CreatedTimeFieldBuilderComponent,
		CurrencyFieldBuilderComponent,
		DateFieldBuilderComponent,
		DropdownFieldBuilderComponent,
		EmailFieldBuilderComponent,
		FormulaFieldBuilderComponent,
		LastModifiedByFieldBuilderComponent,
		LastModifiedTimeFieldBuilderComponent,
		LinkFieldBuilderComponent,
		LookupFieldBuilderComponent,
		NumberFieldBuilderComponent,
		ParagraphFieldBuilderComponent,
		PeopleFieldBuilderComponent,
		PhoneFieldBuilderComponent,
		ProgressFieldBuilderComponent,
		RatingFieldBuilderComponent,
		ReferenceFieldBuilderComponent,
		TextFieldBuilderComponent,
	],
	providers: [
		FieldBuilderService,

		BoardFieldService,
		RecordService,
		TeamService,
	],
})
export class BuilderModule {}
