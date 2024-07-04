import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';

import { I18nLazyRouterModule, IRouteData } from '@core';

import { AuthGrantService } from '../auth/services';

import { CONSTANT as SETTINGS_CONSTANT } from './modules/settings/resources';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{
		path		: '',
		canActivate	: [ AuthGrantService ],
		data		: routeData,
		children: [
			{
				path		: '',
				redirectTo	: SETTINGS_CONSTANT.PATH.MAIN,
				pathMatch	: 'full',
			},
			{
				path		: SETTINGS_CONSTANT.PATH.MAIN,
				loadChildren: () => import( './modules/settings/settings.module' ).then( ( m: any ) => m.SettingsModule ),
				data		: { preload: true },
			},
		],
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class AccountRoutingModules {}
