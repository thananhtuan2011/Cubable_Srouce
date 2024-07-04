import {
	NgModule
} from '@angular/core';
import {
	Routes
} from '@angular/router';

import {
	I18nLazyRouterModule,
	IRouteData
} from '@core';

import {
	CreationComponent,
	WorkspaceComponent
} from './components';
import {
	CONSTANT as BASE_CONSTANT
} from './modules/base/resources';
import {
	CONSTANT as SETTINGS_CONSTANT
} from './modules/settings/resources';
import {
	WorkspaceGrantService
} from './modules/settings/modules/workspace/services';
import {
	CONSTANT
} from './resources';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{
		path		: CONSTANT.PATH.CREATION,
		component	: CreationComponent,
		data		: routeData,
	},
	{
		path			: ':workspaceID',
		component		: WorkspaceComponent,
		canActivateChild: [ WorkspaceGrantService ],
		children: [
			{
				path		: BASE_CONSTANT.PATH.MAIN,
				loadChildren: () => import( './modules/base/base.module' ).then( ( m: any ) => m.BaseModule ),
				data		: { preload: true },
			},
			{
				path		: BASE_CONSTANT.PATH.NOTIFICATION,
				loadChildren: () => import( './modules/notification/notification.module' ).then( ( m: any ) => m.NotificationModule ),
				data		: { preload: true },
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
export class WorkspaceRoutingModule {}
