import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';

import { WGCButtonToggleComponent } from './wgc-button-toggle/wgc-button-toggle.component';
import { WGCButtonToggleItemComponent } from './wgc-button-toggle-item/wgc-button-toggle-item.component';

@NgModule({
	imports: [
		CoreModule,

		WGCIconModule,
	],
	exports		: [ WGCButtonToggleComponent, WGCButtonToggleItemComponent ],
	declarations: [ WGCButtonToggleComponent, WGCButtonToggleItemComponent ],
	providers	: [],
})
export class WGCButtonToggleModule {}
