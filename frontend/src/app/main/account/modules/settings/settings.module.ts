import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import { WGCAvatarPickerModule } from '@wgc/wgc-avatar-picker';
import { WGCButtonModule } from '@wgc/wgc-button';
import { WGCDividerModule } from '@wgc/wgc-divider';
import { WGCFormFieldModule } from '@wgc/wgc-form-field';
import { WGCIconModule } from '@wgc/wgc-icon';
import { WGCListModule } from '@wgc/wgc-list';
import { WGCMenuModule } from '@wgc/wgc-menu';
import { WGCPageModule } from '@wgc/wgc-page';
import { WGCScrollBarModule } from '@wgc/wgc-scroll-bar';
import { WGCSearchBoxModule } from '@wgc/wgc-search-box';
import { WGCTooltipModule } from '@wgc/wgc-tooltip';
import { WGCTruncateModule } from '@wgc/wgc-truncate';

import {
	DialogChangePasswordComponent,
	GeneralComponent,
	SecurityComponent,
	SettingsComponent
} from './components';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
	imports: [
		CoreModule, FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'ACCOUNT.SETTINGS',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		WGCAvatarPickerModule, WGCButtonModule, WGCDividerModule,
		WGCFormFieldModule, WGCIconModule, WGCListModule,
		WGCMenuModule, WGCPageModule, WGCScrollBarModule,
		WGCSearchBoxModule, WGCTooltipModule, WGCTruncateModule,

		SettingsRoutingModule,
	],
	exports		: [
		SettingsComponent, GeneralComponent, SecurityComponent,
		DialogChangePasswordComponent,
	],
	declarations: [
		SettingsComponent, GeneralComponent, SecurityComponent,
		DialogChangePasswordComponent,
	],
	providers	: [],
})
export class SettingsModule {}
