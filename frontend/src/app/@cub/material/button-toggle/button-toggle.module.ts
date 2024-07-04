import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';

import { CUBButtonToggleComponent } from './button-toggle.component';
import { CUBButtonToggleItemComponent } from './button-toggle-item.component';

@NgModule({
	imports: [
		CoreModule,

		CUBIconModule,
	],
	exports: [
		CUBButtonToggleComponent,
		CUBButtonToggleItemComponent,
	],
	declarations: [
		CUBButtonToggleComponent,
		CUBButtonToggleItemComponent,
	],
	providers: [],
})
export class CUBButtonToggleModule {}
