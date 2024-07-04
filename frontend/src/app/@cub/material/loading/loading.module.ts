import { NgModule } from '@angular/core';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { CoreModule } from 'angular-core';

import { CUBLoadingComponent } from './loading.component';

@NgModule({
	imports: [
		RoundProgressModule,

		CoreModule,
	],
	exports		: [ CUBLoadingComponent ],
	declarations: [ CUBLoadingComponent ],
	providers	: [],
})
export class CUBLoadingModule {}
