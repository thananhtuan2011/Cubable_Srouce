import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from 'angular-core';

import {
	CUBExamplePhoneNumberPipe,
	CUBFlagImagePipe
} from '../../pipes';

import { CUBButtonModule } from '../button';
import { CUBFormFieldModule } from '../form-field';
import { CUBIconModule } from '../icon';
import { CUBImageModule } from '../image';
import { CUBMenuModule } from '../menu';
import { CUBSearchBoxModule } from '../search-box';

import {
	CUBPhoneCountryDropdownComponent
} from './phone-country-picker/phone-country-dropdown.component';
import {
	CUBPhoneCountryPickerComponent
} from './phone-country-picker/phone-country-picker.component';
import {
	CUBPhoneFieldComponent
} from './phone-field/phone-field.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBExamplePhoneNumberPipe,
		CUBFlagImagePipe,

		CUBButtonModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBImageModule,
		CUBMenuModule,
		CUBSearchBoxModule,
	],
	exports: [
		CUBExamplePhoneNumberPipe,
		CUBFlagImagePipe,

		CUBPhoneCountryDropdownComponent,
		CUBPhoneCountryPickerComponent,
		CUBPhoneFieldComponent,
	],
	declarations: [
		CUBPhoneCountryDropdownComponent,
		CUBPhoneCountryPickerComponent,
		CUBPhoneFieldComponent,
	],
	providers: [],
})
export class CUBPhoneFieldModule {}
