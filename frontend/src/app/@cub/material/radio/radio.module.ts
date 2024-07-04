import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBRadioComponent } from './radio/radio.component';
import { CUBRadioContentDirective } from './radio/radio-content.directive';
import { CUBRadioGroupComponent } from './radio-group/radio-group.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBRadioComponent,
		CUBRadioContentDirective,
		CUBRadioGroupComponent,
	],
	declarations: [
		CUBRadioComponent,
		CUBRadioContentDirective,
		CUBRadioGroupComponent,
	],
	providers: [],
})
export class CUBRadioModule {}
