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
	CommonModule
} from '../common/common.module';

import {
	CompareValueComponent,
	ConditionComponent,
	FindRecordComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.CONDITION',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBMenuModule,
		CUBFormFieldModule,
		CUBDropdownModule,

		CommonModule,
	],
	exports: [
		ConditionComponent,
		CompareValueComponent,
		FindRecordComponent,
	],
	declarations: [
		ConditionComponent,
		CompareValueComponent,
		FindRecordComponent,
	],
	providers: [],
})
export class ConditionModule {}
