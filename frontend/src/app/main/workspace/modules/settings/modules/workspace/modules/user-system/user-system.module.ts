import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBTabsModule
} from '@cub/material/tabs';
import {
	CUBDividerModule
} from '@cub/material/divider';

import {
	UserSystemComponent
} from './components';
import {
	DispensationModule
} from './modules/dispensation/dispensation.module';
import {
	UserModule
} from './modules/user/user.module';
import {
	TeamModule
} from './modules/team/team.module';
import {
	UserSystemService
} from './services';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.WORKSPACE.USER_SYSTEM',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBTabsModule,
		CUBDividerModule,

		DispensationModule,
		UserModule,
		TeamModule,
	],
	exports: [ UserSystemComponent ],
	declarations: [ UserSystemComponent ],
	providers: [ UserSystemService ],
})
export class UserSystemModule {}
