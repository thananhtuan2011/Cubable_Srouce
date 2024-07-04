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
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';

import {
	CommonModule
} from '../common/common.module';

import {
	DelayComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.DELAY',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBDropdownModule,
		CUBMenuModule,
		CUBFormFieldModule,

		CommonModule,
	],
	exports: [
		DelayComponent,
	],
	declarations: [
		DelayComponent,
	],
	providers: [
	],
})
export class DelayModule {}
