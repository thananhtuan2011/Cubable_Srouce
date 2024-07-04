import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBSwitchComponent } from './switch.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ CUBSwitchComponent ],
	declarations: [ CUBSwitchComponent ],
	providers	: [],
})
export class CUBSwitchModule {}
