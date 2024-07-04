import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBDividerModule } from '../divider';
import { CUBIconModule } from '../icon';

import {
	CUBActionBoxComponent
} from './action-box/action-box.component';
import {
	CUBActionBoxEndComponent
} from './action-box/action-box-end.component';
import {
	CUBActionBoxMiddleComponent
} from './action-box/action-box-middle.component';
import {
	CUBActionBoxStartComponent
} from './action-box/action-box-start.component';
import {
	CUBActionItemComponent
} from './action-item/action-item.component';

@NgModule({
	imports: [
		CoreModule,

		CUBDividerModule,
		CUBIconModule,
	],
	exports: [
		CUBActionBoxComponent,
		CUBActionBoxEndComponent,
		CUBActionBoxMiddleComponent,
		CUBActionBoxStartComponent,
		CUBActionItemComponent,
	],
	declarations: [
		CUBActionBoxComponent,
		CUBActionBoxEndComponent,
		CUBActionBoxMiddleComponent,
		CUBActionBoxStartComponent,
		CUBActionItemComponent,
	],
	providers: [],
})
export class CUBActionBoxModule {}
