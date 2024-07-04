import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCTruncateModule } from '../wgc-truncate';

import { WGCRadioGroupComponent } from './wgc-radio-group//wgc-radio-group.component';
import { WGCRadioComponent } from './wgc-radio/wgc-radio.component';

@NgModule({
	imports: [
		CoreModule,

		WGCTruncateModule,
	],
	exports		: [ WGCRadioGroupComponent, WGCRadioComponent ],
	declarations: [ WGCRadioGroupComponent, WGCRadioComponent ],
	providers	: [],
})
export class WGCRadioModule {}
