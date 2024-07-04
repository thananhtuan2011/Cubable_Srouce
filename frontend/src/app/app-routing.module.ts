import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorComponent } from '@error/components';

import { IRouteData } from '@core';

import { CONSTANT as AUTH_CONSTANT } from '@main/auth/resources';
import { CONSTANT as ACCOUNT_CONSTANT } from '@main/account/resources';
import { CONSTANT as WORKSPACE_CONSTANT } from '@main/workspace/resources';

import { CustomPreloadingStrategy } from './custom-preloading-strategy';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{
		path		: '',
		redirectTo	: AUTH_CONSTANT.PATH.SIGN_IN,
		data		: routeData,
		pathMatch	: 'full',
	},
	{
		path		: ACCOUNT_CONSTANT.PATH.MAIN,
		loadChildren: () => import( './main/account/account.module' ).then( ( m: any ) => m.AccountModule ),
		data		: routeData,
	},
	{
		path		: WORKSPACE_CONSTANT.PATH.MAIN,
		redirectTo	: AUTH_CONSTANT.PATH.SIGN_IN,
		data		: routeData,
		pathMatch	: 'full',
	},
	{
		path		: WORKSPACE_CONSTANT.PATH.MAIN,
		loadChildren: () => import( './main/workspace/workspace.module' ).then( ( m: any ) => m.WorkspaceModule ),
		data		: { preload: true, ...routeData },
	},
	{
		path		: '**',
		component	: ErrorComponent,
		data		: routeData,
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
			{
				useHash: false,
				preloadingStrategy: CustomPreloadingStrategy,
			}
		),
	],
	exports		: [ RouterModule ],
	providers	: [ CustomPreloadingStrategy ],
})
export class AppRoutingModules {}
