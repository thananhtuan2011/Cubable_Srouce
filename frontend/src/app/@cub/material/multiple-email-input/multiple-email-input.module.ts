import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule
} from '@core';

import {
	CUBMultipleEmailInputComponent
} from './multiple-email-input.component';

import {
	CUBButtonModule
} from '../button';
import {
	CUBIconModule
} from '../icon';
import {
	CUBFormFieldModule
} from '../form-field';
import {
	CUBTooltipModule
} from '../tooltip';
import {
	CUBScrollBarModule
} from '../scroll-bar';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBFormFieldModule,
		CUBIconModule,
		CUBButtonModule,
		CUBTooltipModule,
		CUBScrollBarModule,
	],
	exports: [
		CUBMultipleEmailInputComponent,
	],
	declarations: [
		CUBMultipleEmailInputComponent,
	],
	providers: [],
})
export class CUBMultipleEmailInputModule {}
