import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';

import { WGCActionBoxComponent } from './action-box/wgc-action-box.component';
import { WGCActionBoxEndComponent } from './action-box-end/wgc-action-box-end.component';
import { WGCActionBoxMiddleComponent } from './action-box-middle/wgc-action-box-middle.component';
import { WGCActionBoxStartComponent } from './action-box-start/wgc-action-box-start.component';
import { WGCActionItemComponent } from './action-item/wgc-action-item.component';

@NgModule({
	imports: [
		CoreModule,

		WGCButtonModule, WGCIconModule,
	],
	exports: [
		WGCActionBoxComponent, WGCActionBoxEndComponent, WGCActionBoxMiddleComponent,
		WGCActionBoxStartComponent, WGCActionItemComponent,
	],
	declarations: [
		WGCActionBoxComponent, WGCActionBoxEndComponent, WGCActionBoxMiddleComponent,
		WGCActionBoxStartComponent, WGCActionItemComponent,
	],
	providers: [],
})
export class WGCActionBoxModule {}
