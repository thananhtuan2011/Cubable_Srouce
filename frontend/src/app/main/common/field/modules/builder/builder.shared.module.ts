import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule
	// I18nLazyTranslateModule
} from '@core';

import {
	CUBDropdownModule
} from '@cub/material/dropdown';

import {
	CurrencyValuePipe,
	DateValuePipe,
	NumberValuePipe
} from '../../pipes';

import {
	CurrencyFormatSettingsComponent,
	DateFormatSettingsComponent,
	NumberFormatSettingsComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		// I18nLazyTranslateModule.forChild({
		// 	prefix: 'FIELD',
		// 	loader: ( lang: string ) => {
		// 		return import( `./i18n/${lang}.json` );
		// 	},
		// }),

		CUBDropdownModule,

		CurrencyValuePipe,
		DateValuePipe,
		NumberValuePipe,
	],
	exports: [
		CurrencyFormatSettingsComponent,
		DateFormatSettingsComponent,
		NumberFormatSettingsComponent,
	],
	declarations: [
		CurrencyFormatSettingsComponent,
		DateFormatSettingsComponent,
		NumberFormatSettingsComponent,
	],
	providers: [],
})
export class BuilderSharedModule {}
