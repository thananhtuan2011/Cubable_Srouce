import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBBadgeComponent
} from './badge.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBBadgeComponent,
	],
	declarations: [
		CUBBadgeComponent,
	],
})
export class CUBBadgeModule {}
