import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule
} from '@core';

import {
	CUBButtonModule
} from '../button';
import {
	CUBDropdownModule
} from '../dropdown';
import {
	CUBFormFieldModule
} from '../form-field';
import {
	CUBMenuModule
} from '../menu';
import {
	CUBSwitchModule
} from '../switch';

import {
	CUBDatePickerComponent
} from './date-picker/date-picker.component';
import {
	CUBDatePickerDirective
} from './date-picker/date-picker.directive';
import {
	CUBDatePickerInputDirective
} from './date-picker/date-picker-input.directive';
import {
	CUBTimeMenuComponent
} from './time-picker/time-menu.component';
import {
	CUBTimePickerInputDirective
} from './time-picker/time-picker-input.directive';
import {
	CUBTimePickerDirective
} from './time-picker/time-picker.directive';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBMenuModule,
		CUBSwitchModule,
	],
	exports: [
		CUBDatePickerComponent,
		CUBDatePickerDirective,
		CUBDatePickerInputDirective,
		CUBTimeMenuComponent,
		CUBTimePickerDirective,
		CUBTimePickerInputDirective,
	],
	declarations: [
		CUBDatePickerComponent,
		CUBDatePickerDirective,
		CUBDatePickerInputDirective,
		CUBTimeMenuComponent,
		CUBTimePickerDirective,
		CUBTimePickerInputDirective,
	],
})
export class CUBDatePickerModule {}
