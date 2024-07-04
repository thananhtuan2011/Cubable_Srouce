import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';


import { CUBLoadingModule } from '@cub/material/loading';
import { CUBImageModule } from '@cub/material/image';
import { CUBMenuModule } from '@cub/material/menu';
import { CUBButtonModule } from '@cub/material/button';

import { WGCButtonModule } from '@wgc/wgc-button';
import { WGCIconModule } from '@wgc/wgc-icon';
import { WGCCardModule } from '@wgc/wgc-card';
import { WGCFormFieldModule } from '@wgc/wgc-form-field';
import { WGCTooltipModule } from '@wgc/wgc-tooltip';
import { CUBFormFieldModule } from '@cub/material/form-field';

import { NavigationBarModule } from '@main/common/navigation-bar/navigation-bar.module';

import { WorkspaceRoutingModule } from './workspace-routing.module';
import {
	CreationComponent,
	WorkspaceComponent
} from './components';
import {
	WorkspaceExpandService
} from './services';
import {
	NotificationModule
} from './modules/notification/notification.module';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'WORKSPACE',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBLoadingModule,
		CUBImageModule,
		CUBMenuModule,
		CUBButtonModule,
		CUBFormFieldModule,

		WGCButtonModule,
		WGCCardModule,
		WGCFormFieldModule,
		WGCIconModule,
		WGCTooltipModule,

		NavigationBarModule,
		NotificationModule,

		WorkspaceRoutingModule,
	],
	exports: [
		CreationComponent,
		WorkspaceComponent,
	],
	declarations: [
		CreationComponent,
		WorkspaceComponent,
	],
	providers: [
		WorkspaceExpandService,
	],
})
export class WorkspaceModule {}
