import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCMultipleValueInputComponent } from './wgc-multiple-value-input.component';

import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';
import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCTooltipModule } from '../wgc-tooltip';

@NgModule({
	imports: [
		CoreModule, FormModule,

		WGCFormFieldModule, WGCIconModule, WGCTruncateModule,
		WGCButtonModule, WGCTooltipModule,
	],
	exports		: [ WGCMultipleValueInputComponent ],
	declarations: [ WGCMultipleValueInputComponent ],
	providers	: [],
})
export class WGCMultipleValueInputModule {}
