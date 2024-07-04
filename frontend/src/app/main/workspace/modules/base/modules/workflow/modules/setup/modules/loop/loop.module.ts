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
	CUBSwitchModule
} from '@cub/material/switch';
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
	CommonModule
} from '../common/common.module';
import {
	LoopComponent
} from './components/loop.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.LOOP',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBSwitchModule,
		CUBTooltipModule,
		CUBFormFieldModule,
		CUBIconModule,

		CommonModule,
	],
	exports: [
		LoopComponent,
	],
	declarations: [
		LoopComponent,
	],
	providers: [
	],
})
export class LoopModule {}
