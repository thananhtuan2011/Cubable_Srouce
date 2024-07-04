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
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBIconModule
} from '@cub/material/icon';

import {
	CommonModule
} from '../common/common.module';
import {
	AnyBranchComponent,
	ParallelComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.PARALLEL',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBCardModule,
		CUBDropdownModule,
		CUBSwitchModule,
		CUBTooltipModule,
		CUBIconModule,

		CommonModule,
	],
	exports: [
		ParallelComponent,
		AnyBranchComponent,
	],
	declarations: [
		ParallelComponent,
		AnyBranchComponent,
	],
	providers: [
	],
})
export class ParallelModule {}
