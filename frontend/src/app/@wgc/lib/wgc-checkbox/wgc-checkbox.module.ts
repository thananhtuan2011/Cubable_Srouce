import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';

import { WGCCheckboxComponent } from './wgc-checkbox.component';

@NgModule({
	imports: [
		CoreModule,

		WGCIconModule,
	],
	exports		: [ WGCCheckboxComponent ],
	declarations: [ WGCCheckboxComponent ],
	providers	: [],
})
export class WGCCheckboxModule {}
