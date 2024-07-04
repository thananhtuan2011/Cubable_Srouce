import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCDrawerContainerComponent } from './drawer-container/wgc-drawer-container.component';
import { WGCDrawerComponent } from './drawer/wgc-drawer.component';
import { WGCDrawerLazyDirective } from './drawer/wgc-drawer-lazy.directive';
import { WGCDrawerContentComponent } from './drawer-content/wgc-drawer-content.component';

@NgModule({
	imports: [
		CoreModule,
		// BrowserAnimationsModule,

		WGCButtonModule, WGCTooltipModule,
	],
	exports		: [ WGCDrawerContainerComponent, WGCDrawerComponent, WGCDrawerLazyDirective, WGCDrawerContentComponent ],
	declarations: [ WGCDrawerContainerComponent, WGCDrawerComponent, WGCDrawerLazyDirective, WGCDrawerContentComponent ],
	providers	: [],
})
export class WGCDrawerModule {}
