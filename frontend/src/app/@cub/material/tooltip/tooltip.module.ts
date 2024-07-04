import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from 'angular-core';

import { CUBTooltipComponent } from './tooltip.component';
import { CUBTooltipDirective } from './tooltip.directive';
import { CUBTooltipService } from './tooltip.service';

@NgModule({
	imports: [
		OverlayModule,
		PortalModule,

		CoreModule,
	],
	exports: [
		CUBTooltipDirective,
	],
	declarations: [
		CUBTooltipComponent,
		CUBTooltipDirective,
	],
	providers: [
		CUBTooltipService,
	],
})
export class CUBTooltipModule {}
