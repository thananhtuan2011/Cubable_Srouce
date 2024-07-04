import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBEmojiPickerModule
} from '../emoji-picker';

import {
	CUBRatingComponent
} from './rating.component';

@NgModule({
	imports: [
		CoreModule,

		CUBEmojiPickerModule,
	],
	exports: [
		CUBRatingComponent,
	],
	declarations: [
		CUBRatingComponent,
	],
})
export class CUBRatingModule {}
