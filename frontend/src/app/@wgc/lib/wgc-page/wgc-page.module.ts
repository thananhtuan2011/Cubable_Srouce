import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCScrollBarModule } from '../wgc-scroll-bar';

import { WGCPageComponent } from './page/wgc-page.component';
import { WGCPageHeaderDirective } from './page-header/wgc-page-header.directive';
import { WGCPageContentDirective } from './page-content/wgc-page-content.directive';

@NgModule({
	imports: [
		CoreModule,

		WGCScrollBarModule,
	],
	exports		: [ WGCPageComponent, WGCPageHeaderDirective, WGCPageContentDirective ],
	declarations: [ WGCPageComponent, WGCPageHeaderDirective, WGCPageContentDirective ],
	providers	: [],
})
export class WGCPageModule {}
