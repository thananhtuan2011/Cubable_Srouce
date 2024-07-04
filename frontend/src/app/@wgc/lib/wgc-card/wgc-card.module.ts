import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCCardComponent } from './wgc-card.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ WGCCardComponent ],
	declarations: [ WGCCardComponent ],
	providers	: [],
})
export class WGCCardModule {}
