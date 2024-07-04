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
	BaseComponent,
	DetailComponent
} from './components';
import {
	CONSTANT
} from './resources';

const routeData: IRouteData = { cache: false };
export const routes: Routes = [
	{
		path		: '',
		component	: BaseComponent,
		data		: routeData,
	},
	{
		path: `${CONSTANT.PATH.DETAIL}/:id`,
		component: DetailComponent,
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class BaseRoutingModule {}
