import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';

import { WGCTooltipComponent } from './wgc-tooltip.component';
import { WGCTooltipDirective } from './wgc-tooltip.directive';

@NgModule({
	imports: [
		OverlayModule, PortalModule,

		CoreModule,

		WGCIconModule,
	],
	exports		: [ WGCTooltipComponent, WGCTooltipDirective ],
	declarations: [ WGCTooltipComponent, WGCTooltipDirective ],
	providers	: [],
})
export class WGCTooltipModule {}
