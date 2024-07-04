import { NgModule } from '@angular/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { CoreModule } from '@core';

import { WGCLoadingComponent } from './wgc-loading.component';

@NgModule({
	imports: [
		RoundProgressModule,

		CoreModule,
	],
	exports		: [ WGCLoadingComponent ],
	declarations: [ WGCLoadingComponent ],
	providers	: [],
})
export class WGCLoadingModule {}
