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
	UnloadCheckerService
} from '@main/unload-checker';

import {
	SettingsComponent
} from './components';
import {
	WorkspaceSettingComponent
} from './modules/workspace/components';
import {
	CONSTANT
} from './resources';

const routeData: IRouteData = { cache: true };

export const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
		data: routeData,
		children: [
			{
				path: '',
				redirectTo: CONSTANT.PATH.USER,
				pathMatch: 'full',
			},
			// {
			// 	path			: CONSTANT.USER_PATH,
			// 	component		: UserPreferencesComponent,
			// 	data			: routeData,
			// 	canDeactivate	: [ UnloadCheckerService ],
			// },
			{
				path: CONSTANT.PATH.WORKSPACE,
				component: WorkspaceSettingComponent,
				data: routeData,
				canDeactivate: [ UnloadCheckerService ],
			},
		],
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class SettingsRoutingModule {}
