import {
	NgModule
} from '@angular/core';
import {
	DragDropModule
} from '@angular/cdk/drag-drop';

import {
	CoreModule
} from 'angular-core';

import {
	CUBSliderComponent
} from './slider.component';

@NgModule({
	imports: [
		DragDropModule,

		CoreModule,
	],
	exports: [
		CUBSliderComponent,
	],
	declarations: [
		CUBSliderComponent,
	],
})
export class CUBSliderModule {}
