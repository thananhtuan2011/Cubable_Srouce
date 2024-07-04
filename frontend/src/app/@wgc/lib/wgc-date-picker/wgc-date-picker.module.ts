import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule, FormModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCDividerModule } from '../wgc-divider';
import { WGCIconModule } from '../wgc-icon';
import { WGCMenuModule } from '../wgc-menu';
import { WGCSwitchModule } from '../wgc-switch';
import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCDatePickerComponent } from './wgc-date-picker.component';
import { WGCDatePickerDirective } from './wgc-date-picker.directive';

@NgModule({
	imports: [
		OverlayModule, PortalModule,

		CoreModule, FormModule,

		WGCButtonModule, WGCDividerModule, WGCIconModule,
		WGCMenuModule, WGCSwitchModule, WGCFormFieldModule,
		WGCTooltipModule,
	],
	exports		: [ WGCDatePickerComponent, WGCDatePickerDirective ],
	declarations: [ WGCDatePickerComponent, WGCDatePickerDirective ],
	providers	: [],
})
export class WGCDatePickerModule {}
