import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBDialogModule
} from '@cub/material/dialog';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBListModule
} from '@cub/material/list';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBBadgeModule
} from '@cub/material/badge';
import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBShowMoreModule
} from '@cub/material/show-more';
import {
	CUBLoadingModule
} from '@cub/material/loading';

import {
	CustomWorkflowComponent,
	DialogWorkflowComponent
} from './components';
import {
	WorkflowService
} from './services';
import {
	ChartModule
} from './modules/chart/chart.module';
import {
	SetupModule
} from './modules/setup/setup.module';
import {
	DateValuePipe
} from '@main/common/field/pipes';

@NgModule({
	imports: [
		CoreModule,

		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBDialogModule,
		CUBDividerModule,
		CUBButtonModule,
		CUBTooltipModule,
		CUBScrollBarModule,
		CUBListModule,
		CUBIconModule,
		CUBBadgeModule,
		CUBCardModule,
		CUBSwitchModule,
		CUBMenuModule,
		CUBPopupModule,
		CUBFormFieldModule,
		CUBShowMoreModule,
		CUBLoadingModule,

		DateValuePipe,

		ChartModule,
		SetupModule,
	],
	exports: [
		DialogWorkflowComponent,
		CustomWorkflowComponent,
	],
	declarations: [
		DialogWorkflowComponent,
		CustomWorkflowComponent,
	],
	providers: [
		WorkflowService,
	],
})
export class WorkflowModule {}
