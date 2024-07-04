import { NgModule } from '@angular/core';
import { ColorPhotoshopModule } from 'ngx-color/photoshop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCTabsModule } from '../wgc-tabs';
import { WGCClipboardCopyModule } from '../wgc-clipboard-copy';
import { WGCIconModule } from '../wgc-icon';
import { WGCCodeBlockModule } from '../wgc-code-block';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCColorPickerComponent } from './color-picker/wgc-color-picker.component';
import { WGCColorPickerDirective } from './color-picker/wgc-color-picker.directive';
import { WGCColorDotComponent } from './color-dot/wgc-color-dot.component';

@NgModule({
	imports: [
		OverlayModule, PortalModule, ColorPhotoshopModule,

		CoreModule,

		WGCButtonModule, WGCTabsModule, WGCClipboardCopyModule,
		WGCIconModule, WGCCodeBlockModule, WGCTooltipModule,
	],
	exports		: [ WGCColorPickerComponent, WGCColorPickerDirective, WGCColorDotComponent ],
	declarations: [ WGCColorPickerComponent, WGCColorPickerDirective, WGCColorDotComponent ],
	providers	: [],
})
export class WGCColorPickerModule {}
