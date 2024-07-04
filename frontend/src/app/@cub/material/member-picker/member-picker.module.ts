import {
	NgModule
} from '@angular/core';
import {
	ScrollingModule
} from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule
} from '@core';

import {
	CUBPalettePipe
} from '../../pipes';

import {
	CUBIconModule
} from '../icon';
import {
	CUBButtonModule
} from '../button';
import {
	CUBTooltipModule
} from '../tooltip';
import {
	CUBDividerModule
} from '../divider';
import {
	CUBMenuModule
} from '../menu';
import {
	CUBImageModule
} from '../image';
import {
	CUBFormFieldModule
} from '../form-field';
import {
	CUBAvatarModule
} from '../avatar';
import {
	CUBScrollBarModule
} from '../scroll-bar';

import {
	CUBMemberComponent
} from './member/member.component';
import {
	CUBMemberListComponent
} from './member-list/member-list.component';
import {
	CUBMemberPickerComponent
} from './member-picker/member-picker.component';
import {
	CUBMemberPickerDirective
} from './member-picker/member-picker.directive';

@NgModule({
	imports: [
		ScrollingModule,

		CoreModule,
		FormModule,

		CUBAvatarModule,
		CUBIconModule,
		CUBButtonModule,
		CUBTooltipModule,
		CUBDividerModule,
		CUBMenuModule,
		CUBImageModule,
		CUBFormFieldModule,
		CUBScrollBarModule,

		CUBPalettePipe,
	],
	exports: [
		CUBMemberComponent,
		CUBMemberListComponent,
		CUBMemberPickerComponent,
		CUBMemberPickerDirective,
	],
	declarations: [
		CUBMemberComponent,
		CUBMemberListComponent,
		CUBMemberPickerComponent,
		CUBMemberPickerDirective,
	],
	providers: [],
})
export class CUBMemberPickerModule {}
