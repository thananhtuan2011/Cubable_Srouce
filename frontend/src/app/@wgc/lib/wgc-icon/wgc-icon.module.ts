import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIconComponent } from './wgc-icon.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ WGCIconComponent ],
	declarations: [ WGCIconComponent ],
	providers	: [],
})
export class WGCIconModule {}
