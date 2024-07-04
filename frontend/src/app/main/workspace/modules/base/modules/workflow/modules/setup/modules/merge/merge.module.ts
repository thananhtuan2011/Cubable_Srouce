import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	MergeComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.MERGE',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),
	],
	exports: [
		MergeComponent,
	],
	declarations: [
		MergeComponent,
	],
	providers: [
	],
})
export class MergeModule {}
