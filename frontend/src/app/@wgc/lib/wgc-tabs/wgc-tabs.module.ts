import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCScrollBarModule } from '../wgc-scroll-bar';
import { WGCDividerModule } from '../wgc-divider';

import { WGCTabGroupComponent } from './tab-group/wgc-tab-group.component';
import { WGCTabComponent } from './tab/wgc-tab.component';
import { WGCTabHeaderDirective } from './tab-header/wgc-tab-header.directive';
import { WGCTabContentDirective } from './tab-content/wgc-tab-content.directive';

@NgModule({
	imports: [
		CoreModule,

		WGCIconModule, WGCScrollBarModule, WGCDividerModule,
	],
	exports		: [ WGCTabGroupComponent, WGCTabComponent, WGCTabHeaderDirective, WGCTabContentDirective ],
	declarations: [ WGCTabGroupComponent, WGCTabComponent, WGCTabHeaderDirective, WGCTabContentDirective ],
	providers	: [],
})
export class WGCTabsModule {}
