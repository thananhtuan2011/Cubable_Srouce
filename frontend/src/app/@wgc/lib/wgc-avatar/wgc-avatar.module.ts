import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCEmojiPickerModule } from '../wgc-emoji-picker';
import { WGCAvatarComponent } from './wgc-avatar.component';

@NgModule({
	imports: [
		CoreModule,

		WGCEmojiPickerModule,
	],
	exports		: [ WGCAvatarComponent ],
	declarations: [ WGCAvatarComponent ],
	providers	: [],
})
export class WGCAvatarModule {}
