import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBButtonModule } from '../button';
import { CUBMenuModule } from '../menu';

import {
	CUBColorPickerComponent
} from './color-picker.component';
import {
	CUBColorPickerDirective
} from './color-picker.directive';

@NgModule({
	imports: [
		CoreModule,

		CUBButtonModule,
		CUBMenuModule,
	],
	exports: [
		CUBColorPickerComponent,
		CUBColorPickerDirective,
	],
	declarations: [
		CUBColorPickerComponent,
		CUBColorPickerDirective,
	],
	providers: [],
})
export class CUBColorPickerModule {}
