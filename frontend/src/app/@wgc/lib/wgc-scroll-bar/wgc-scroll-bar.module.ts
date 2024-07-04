import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCScrollBarComponent } from './wgc-scroll-bar/wgc-scroll-bar.component';
import { WGCScrollBarDirective } from './wgc-scroll-bar/wgc-scroll-bar.directive';
import { WGCScrollBarViewPortDirective } from './wgc-scroll-bar-view-port/wgc-scroll-bar-view-port.directive';
import { WGCScrollBarViewPortItemDirective } from './wgc-scroll-bar-view-port/wgc-scroll-bar-view-port-item.directive';

@NgModule({
	imports: [ CoreModule ],
	exports: [
		WGCScrollBarComponent, WGCScrollBarDirective, WGCScrollBarViewPortDirective,
		WGCScrollBarViewPortItemDirective,
	],
	declarations: [
		WGCScrollBarComponent, WGCScrollBarDirective, WGCScrollBarViewPortDirective,
		WGCScrollBarViewPortItemDirective,
	],
	providers: [],
})
export class WGCScrollBarModule {}
