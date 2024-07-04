import { NgModule } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { CoreModule } from 'angular-core';

import { CUBMenuModule } from '../menu';

import {
	CUBEmojiComponent
} from './emoji/emoji.component';
import {
	CUBEmojiPickerComponent
} from './emoji-picker/emoji-picker.component';
import {
	CUBEmojiPickerDirective
} from './emoji-picker/emoji-picker.directive';

@NgModule({
	imports: [
		PickerModule,

		CoreModule,

		CUBMenuModule,
	],
	exports: [
		CUBEmojiComponent,
		CUBEmojiPickerComponent,
		CUBEmojiPickerDirective,
	],
	declarations: [
		CUBEmojiComponent,
		CUBEmojiPickerComponent,
		CUBEmojiPickerDirective,
	],
	providers: [],
})
export class CUBEmojiPickerModule {}
