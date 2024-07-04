import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBSwitchModule
} from '@cub/material/switch';

import {
	CommonModule
} from '../common/common.module';

import {
	SubProcessComponent,
	OtherRecordComponent,
	CompleteSettingComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.SUB_PROCESS',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBMenuModule,
		CUBFormFieldModule,
		CUBDropdownModule,
		CUBIconModule,
		CUBSwitchModule,

		CommonModule,
	],
	exports: [
		SubProcessComponent,
		OtherRecordComponent,
		CompleteSettingComponent,
	],
	declarations: [
		SubProcessComponent,
		OtherRecordComponent,
		CompleteSettingComponent,
	],
	providers: [],
})
export class SubProcessModule {}
