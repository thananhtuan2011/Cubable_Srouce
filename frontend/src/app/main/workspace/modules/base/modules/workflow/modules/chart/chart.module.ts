import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBFlowchartModule
} from '@cub/material/flowchart';
import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	ChartComponent
} from './components';
import {
	StripHtmlPipe
} from './pipes';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.CHART',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBFormFieldModule,
		CUBFlowchartModule,
		CUBCardModule,
		CUBButtonModule,
		CUBMenuModule,
		CUBTooltipModule,
		CUBIconModule,

		CUBPalettePipe,
	],
	exports: [
		ChartComponent,
	],
	declarations: [
		ChartComponent,

		StripHtmlPipe,
	],
	providers: [
	],
})
export class ChartModule {}
