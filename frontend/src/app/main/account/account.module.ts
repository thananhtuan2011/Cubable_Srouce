import { NgModule } from '@angular/core';

import { CoreModule, I18nLazyTranslateModule } from '@core';

// import { SettingsModule } from './modules/settings/settings.module';
import { AccountRoutingModules } from './account-routing.module';
import { AccountComponent } from './components';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'ACCOUNT',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		// SettingsModule,

		AccountRoutingModules,
	],
	exports		: [ AccountComponent ],
	declarations: [ AccountComponent ],
	providers	: [],
})
export class AccountModule {}
