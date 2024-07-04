import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	I18nLazyTranslateModule
} from '@core';

import {
	WGCButtonModule
} from '@wgc/wgc-button';
import {
	WGCIconModule
} from '@wgc/wgc-icon';
import {
	WGCMenuModule
} from '@wgc/wgc-menu';
import {
	WGCPageModule
} from '@wgc/wgc-page';
import {
	WGCTooltipModule
} from '@wgc/wgc-tooltip';

// import {
// 	AccountModule
// } from '@main/account/account.module';

import {
	SettingsComponent
} from './components';
// import {
// 	UserPreferencesModule
// } from './modules/user-preferences/user-preferences.module';
import {
	WorkspaceSettingModule
} from './modules/workspace/workspace-setting.module';
import {
	SettingsDialogService
} from './services';
import {
	SettingsRoutingModule
} from './settings.routing';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		WGCButtonModule,
		WGCIconModule,
		WGCMenuModule,
		WGCPageModule,
		WGCTooltipModule,

		WorkspaceSettingModule,
		// UserPreferencesModule,
		// AccountModule,

		SettingsRoutingModule,
	],
	exports		: [ SettingsComponent ],
	declarations: [ SettingsComponent ],
	providers	: [ SettingsDialogService ],
})
export class SettingsModule {}
