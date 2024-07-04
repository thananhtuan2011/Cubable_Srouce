import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes
} from '@angular/router';

import { IRouteData } from '@core';

import { ExternalComponent } from './components';
import { CONSTANT } from './resources';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{
		path: `${CONSTANT.SHARING_PATH}/:workspaceID/:formID`,
		component: ExternalComponent,
		data: routeData,
	},
];

// TODO sử dụng tạm RouterModule => cân nhắc đổi sang I18nLazyRouterModule
@NgModule({
	imports: [ RouterModule.forChild( routes ) ],
	exports: [ RouterModule ],
})
export class BoardFormRoutingModule {}
