import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCDividerComponent } from './wgc-divider.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ WGCDividerComponent ],
	declarations: [ WGCDividerComponent ],
	providers	: [],
})
export class WGCDividerModule {}
