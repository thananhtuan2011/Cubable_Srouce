import {
	NgModule
} from '@angular/core';
import {
	ScrollingModule
} from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBListModule
} from '@cub/material/list';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBDividerModule
} from '@cub/material/divider';

import {
	CommonModule
} from '../common/common.module';

import {
	WorkspaceSettingComponent
} from './components';
import {
	UserSystemModule
} from './modules/user-system/user-system.module';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		ScrollingModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.WORKSPACE',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBListModule,
		CUBScrollBarModule,
		CUBIconModule,
		CUBDividerModule,

		CommonModule,
		UserSystemModule,
	],
	exports: [
		WorkspaceSettingComponent,
	],
	declarations: [
		WorkspaceSettingComponent,
	],
	providers: [],
})
export class WorkspaceSettingModule {}
