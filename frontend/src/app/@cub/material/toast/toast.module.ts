import {
	NgModule
} from '@angular/core';
import {
	OverlayModule
} from '@angular/cdk/overlay';
import {
	PortalModule
} from '@angular/cdk/portal';

import {
	CoreModule
} from 'angular-core';

import {
	CUBButtonModule
} from '../button';
import {
	CUBImageModule
} from '../image';

import {
	CUBToastComponent
} from './toast/toast.component';
import {
	CUBToastService
} from './toast/toast.service';
import {
	CUBToastGroupComponent
} from './toast-group/toast-group.component';

@NgModule({
	imports: [
		OverlayModule,
		PortalModule,

		CoreModule,

		CUBButtonModule,
		CUBImageModule,
	],
	exports: [
		CUBToastComponent,
		CUBToastGroupComponent,
	],
	declarations: [
		CUBToastComponent,
		CUBToastGroupComponent,
	],
	providers: [
		CUBToastService,
	],
})
export class CUBToastModule {}
