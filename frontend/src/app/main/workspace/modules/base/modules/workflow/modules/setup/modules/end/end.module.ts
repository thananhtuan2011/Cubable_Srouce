import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBRadioModule
} from '@cub/material/radio';
import {
	CUBCardModule
} from '@cub/material/card';

import {
	CommonModule
} from '../common/common.module';

import {
	EndComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.END',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBRadioModule,

		CommonModule,
	],
	exports: [
		EndComponent,
	],
	declarations: [
		EndComponent,
	],
	providers: [
	],
})
export class EndModule {}
