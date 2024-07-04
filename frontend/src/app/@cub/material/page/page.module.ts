import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule } from 'angular-core';

import { CUBScrollBarModule } from '../scroll-bar';

import { CUBPageComponent } from './page.component';
import { CUBPageContentDirective } from './page-content.directive';
import { CUBPageHeaderDirective } from './page-header.directive';

@NgModule({
	imports: [
		ScrollingModule,

		CoreModule,

		CUBScrollBarModule,
	],
	exports: [
		CUBPageComponent,
		CUBPageContentDirective,
		CUBPageHeaderDirective,
	],
	declarations: [
		CUBPageComponent,
		CUBPageContentDirective,
		CUBPageHeaderDirective,
	],
	providers: [],
})
export class CUBPageModule {}
