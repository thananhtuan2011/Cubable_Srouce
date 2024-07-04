
import {
	NgModule
} from '@angular/core';

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
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBChipModule
} from '@cub/material/chip';

import {
	FieldMetadataPipe
} from '@main/common/field/pipes';
import {
	InputModule
} from '@main/common/field/modules/input/input.module';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBEditorModule
} from '@cub/material/editor';

import {
	CommonModule
} from '../common/common.module';

import {
	ActionComponent,
	ChangeValueComponent,
	CreateRowComponent,
	DeleteRowComponent,
	NotifyComponent
} from './components';
import {
	SelectRowComponent,
	SetRowContentComponent
} from './common/components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.ACTION',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBCardModule,
		CUBDropdownModule,
		CUBMenuModule,
		CUBIconModule,
		CUBMemberPickerModule,
		CUBFormFieldModule,
		CUBSearchBoxModule,
		CUBTooltipModule,
		CUBChipModule,
		CUBScrollBarModule,
		CUBEditorModule,

		FieldMetadataPipe,
		InputModule,

		CommonModule,
	],
	exports: [
		ActionComponent,
		ChangeValueComponent,
		SelectRowComponent,
		DeleteRowComponent,
		SetRowContentComponent,
		CreateRowComponent,
		NotifyComponent,
	],
	declarations: [
		ActionComponent,
		ChangeValueComponent,
		SelectRowComponent,
		NotifyComponent,
		DeleteRowComponent,
		SetRowContentComponent,
		CreateRowComponent,
	],
	providers: [
	],
})
export class ActionModule {}
