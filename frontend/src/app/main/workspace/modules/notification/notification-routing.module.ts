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
	NotificationPageComponent
} from './components';

const routeData: IRouteData
	= { cache: false };
export const routes: Routes = [
	{
		path: '',
		component: NotificationPageComponent,
		data: routeData,
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class NotificationRoutingModule {}
