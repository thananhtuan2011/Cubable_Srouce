import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBDividerComponent } from './divider.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ CUBDividerComponent ],
	declarations: [ CUBDividerComponent ],
	providers	: [],
})
export class CUBDividerModule {}
