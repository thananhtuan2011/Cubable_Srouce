import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCMenuModule } from '../wgc-menu';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCCropperComponent } from './wgc-cropper.component';

@NgModule({
	imports: [
		CoreModule,

		WGCButtonModule, WGCMenuModule, WGCTooltipModule,
	],
	exports		: [ WGCCropperComponent ],
	declarations: [ WGCCropperComponent ],
	providers	: [],
})
export class WGCCropperModule {}
