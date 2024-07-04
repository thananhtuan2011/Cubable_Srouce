import {
	NgModule
} from '@angular/core';
import {
	RouterModule,
	Routes
} from '@angular/router';

import {
	IRouteData
} from '@core';

import {
	InvitationComponent,
	ResetPasswordComponent,
	SignInComponent,
	SignOutComponent,
	SignUpComponent
} from './components';
import {
	CONSTANT
} from './resources';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{
		path: CONSTANT.PATH.SIGNUP,
		component: SignUpComponent,
		data: routeData,
	},
	{
		path: CONSTANT.PATH.SIGN_IN,
		component: SignInComponent,
		data: routeData,
	},
	{
		path: CONSTANT.PATH.RESET_PASSWORD,
		component: ResetPasswordComponent,
		data: routeData,
	},
	{
		path: CONSTANT.PATH.SIGN_OUT,
		component: SignOutComponent,
		data: routeData,
	},
	{
		path: CONSTANT.PATH.ACCEPT_INVITATION,
		component: InvitationComponent,
		data: routeData,
	},
];

@NgModule({
	imports: [ RouterModule.forChild( routes ) ],
	exports: [ RouterModule ],
})
export class AuthRoutingModule {}
