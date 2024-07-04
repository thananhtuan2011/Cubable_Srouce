import { NgModule } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCEmojiPickerComponent } from './emoji-picker/wgc-emoji-picker.component';
import { WGCEmojiPickerDirective } from './emoji-picker/wgc-emoji-picker.directive';
import { WGCEmojiComponent } from './emoji/wgc-emoji.component';

@NgModule({
	imports: [
		OverlayModule, PortalModule, PickerModule,

		CoreModule,

		WGCButtonModule, WGCTooltipModule,
	],
	exports		: [ WGCEmojiPickerComponent, WGCEmojiPickerDirective, WGCEmojiComponent ],
	declarations: [ WGCEmojiPickerComponent, WGCEmojiPickerDirective, WGCEmojiComponent ],
	providers	: [],
})
export class WGCEmojiPickerModule {}
