import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCSwitchComponent } from './wgc-switch.component';

@NgModule({
	imports		: [ FormModule, CoreModule ],
	exports		: [ WGCSwitchComponent ],
	declarations: [ WGCSwitchComponent ],
	providers	: [],
})
export class WGCSwitchModule {}
