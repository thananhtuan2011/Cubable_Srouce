import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBCheckboxComponent
} from './checkbox.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBCheckboxComponent,
	],
	declarations: [
		CUBCheckboxComponent,
	],
})
export class CUBCheckboxModule {}
