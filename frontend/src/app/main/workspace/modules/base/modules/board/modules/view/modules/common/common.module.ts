import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule,
	CUBFormFieldModule,
	CUBIconModule,
	CUBMenuModule,
	CUBSwitchModule,
	CUBToastModule,
	CUBTooltipModule
} from '@cub/material';

import { CUBPalettePipe } from '@cub/pipes';

@NgModule({
	imports: [
		CoreModule, FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'VIEW.COMMON',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBMenuModule,
		CUBIconModule,
		CUBButtonModule,
		CUBFormFieldModule,
		CUBSwitchModule,
		CUBTooltipModule,
		CUBToastModule,

		CUBPalettePipe,
	],
	exports: [
		CoreModule, FormModule,

		CUBMenuModule,
		CUBIconModule,
		CUBButtonModule,
		CUBFormFieldModule,
		CUBSwitchModule,
		CUBTooltipModule,

		CUBPalettePipe,
	],
	declarations: [],
	providers: [],
})
export class CommonModule {}
