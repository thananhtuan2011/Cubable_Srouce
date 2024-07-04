import { NgModule } from '@angular/core';

import { I18nLazyTranslateModule } from '@core';

@NgModule({
	imports: [
		I18nLazyTranslateModule.forChild({
			prefix: 'WGC',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),
	],
	exports		: [],
	declarations: [],
	providers	: [],
})
export class WGCModule {}
