import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCInlineInputComponent } from './wgc-inline-input.component';

@NgModule({
	imports: [
		CoreModule, FormModule,

		WGCFormFieldModule, WGCTooltipModule,
	],
	exports		: [ WGCInlineInputComponent ],
	declarations: [ WGCInlineInputComponent ],
	providers	: [],
})
export class WGCInlineInputModule {}
