import {
	NgModule
} from '@angular/core';
import {
	RouterModule
} from '@angular/router';

import {
	CoreModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBBadgeModule
} from '@cub/material/badge';
import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	SettingsDialogService
} from '@main/workspace/modules/settings/services';

import {
	WorkspaceExpandService
} from '@main/workspace/services';

import {
	NavigationBarComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		RouterModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'NAVIGATION',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBDividerModule,
		CUBIconModule,
		CUBButtonModule,
		CUBAvatarModule,
		CUBMenuModule,
		CUBLoadingModule,
		CUBImageModule,
		CUBBadgeModule,

		CUBPalettePipe,
	],
	exports	: [ NavigationBarComponent ],
	declarations: [ NavigationBarComponent ],
	providers: [
		SettingsDialogService,
		WorkspaceExpandService,
	],
})
export class NavigationBarModule {}
