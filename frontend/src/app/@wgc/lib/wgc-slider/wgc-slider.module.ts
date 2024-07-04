import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCSliderComponent } from './wgc-slider.component';

@NgModule({
	imports: [
		CoreModule, FormModule,

		WGCTooltipModule,
	],
	exports		: [ WGCSliderComponent ],
	declarations: [ WGCSliderComponent ],
	providers	: [],
})
export class WGCSliderModule {}
