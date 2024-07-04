import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBScrollBarComponent
} from './scroll-bar.component';
import {
	CUBScrollBarDirective
} from './scroll-bar.directive';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBScrollBarComponent,
		CUBScrollBarDirective,
	],
	declarations: [
		CUBScrollBarComponent,
		CUBScrollBarDirective,
	],
	providers: [],
})
export class CUBScrollBarModule {}
