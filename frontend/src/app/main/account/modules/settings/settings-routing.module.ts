import {
	NgModule
} from '@angular/core';
import {
	Routes
} from '@angular/router';

import {
	I18nLazyRouterModule, IRouteData
} from '@core';

import {
	UnloadCheckerService
} from '@main/unload-checker';

import {
	SettingsComponent
} from './components';

const routeData: IRouteData = { cache: false };
export const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
		data: routeData,
		canDeactivate: [ UnloadCheckerService ],
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class SettingsRoutingModule {}
