import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';
import { CUBLoadingModule } from '../loading';

import { CUBBasicButtonComponent } from './basic-button/basic-button.component';
import { CUBButtonComponent } from './button/button.component';
import { CUBFloatingButtonComponent } from './floating-button/floating-button.component';
import { CUBClearButtonComponent } from './clear-button/clear-button.component';

@NgModule({
	imports: [
		CoreModule,

		CUBIconModule,
		CUBLoadingModule,
	],
	exports: [
		CUBBasicButtonComponent,
		CUBButtonComponent,
		CUBFloatingButtonComponent,
		CUBClearButtonComponent,
	],
	declarations: [
		CUBBasicButtonComponent,
		CUBButtonComponent,
		CUBFloatingButtonComponent,
		CUBClearButtonComponent,
	],
	providers: [],
})
export class CUBButtonModule {}
