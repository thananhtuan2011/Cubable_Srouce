import {
	NgModule
} from '@angular/core';

import {
	I18nLazyTranslateModule
} from 'angular-core';

@NgModule({
	imports: [
		I18nLazyTranslateModule
		.forChild({
			prefix: 'CUB',
			loader: ( lang: string ) => {
				return import(
					`./i18n/${lang}.json`
				);
			},
		}),
	],
})
export class CUBModule {}
