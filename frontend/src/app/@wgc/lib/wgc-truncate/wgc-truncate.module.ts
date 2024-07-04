import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCBlockTruncateDirective } from './block-truncate/wgc-block-truncate.directive';
import { WGCTruncateComponent } from './truncate/wgc-truncate.component';

@NgModule({
	imports: [
		CoreModule,

		WGCTooltipModule,
	],
	exports		: [ WGCBlockTruncateDirective, WGCTruncateComponent ],
	declarations: [ WGCBlockTruncateDirective, WGCTruncateComponent ],
	providers	: [],
})
export class WGCTruncateModule {}
