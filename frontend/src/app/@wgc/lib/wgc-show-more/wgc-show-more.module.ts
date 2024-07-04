import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCShowMoreComponent } from './wgc-show-more.component';

@NgModule({
	imports: [
		CoreModule,

		WGCButtonModule, WGCIconModule, WGCTooltipModule,
	],
	exports		: [ WGCShowMoreComponent ],
	declarations: [ WGCShowMoreComponent ],
	providers	: [],
})
export class WGCShowMoreModule {}
