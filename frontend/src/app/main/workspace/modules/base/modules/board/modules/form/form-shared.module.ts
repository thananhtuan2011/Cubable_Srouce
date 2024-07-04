import {
	NgModule
} from '@angular/core';
import {
	RecaptchaModule
} from 'ng-recaptcha';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBPhoneFieldModule
} from '@cub/material/phone-field';
import {
	CUBDatePickerModule
} from '@cub/material/date-picker';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBRatingModule
} from '@cub/material/rating';
import {
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBFilePickerModule
} from '@cub/material/file-picker';
import {
	CUBLoadingModule
} from '@cub/material/loading';

import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	CurrencyValuePipe,
	FieldMetadataPipe,
	NumberValuePipe
} from '@main/common/field/pipes';
import {
	FieldModule
} from '@main/common/field/field.module';

import {
	ExternalComponent,
	SubmittingComponent
} from './components';
import {
	BoardFormRoutingModule
} from './form-routing.module';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		RecaptchaModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.FORM',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBImageModule,
		CUBButtonModule,
		CUBDividerModule,
		CUBIconModule,
		CUBScrollBarModule,
		CUBFormFieldModule,
		CUBCheckboxModule,
		CUBDropdownModule,
		CUBDatePickerModule,
		CUBPhoneFieldModule,
		CUBMemberPickerModule,
		CUBRatingModule,
		CUBSliderModule,
		CUBFilePickerModule,
		CUBLoadingModule,

		FieldMetadataPipe,
		CUBPalettePipe,
		NumberValuePipe,
		CurrencyValuePipe,

		FieldModule,

		BoardFormRoutingModule,
	],
	exports: [
		CoreModule,
		FormModule,
		RecaptchaModule,

		CUBImageModule,
		CUBButtonModule,
		CUBDividerModule,
		CUBIconModule,
		CUBScrollBarModule,
		CUBFormFieldModule,
		CUBCheckboxModule,
		CUBDropdownModule,
		CUBDatePickerModule,
		CUBPhoneFieldModule,
		CUBMemberPickerModule,
		CUBRatingModule,
		CUBSliderModule,
		CUBFilePickerModule,
		CUBLoadingModule,

		FieldMetadataPipe,
		CUBPalettePipe,
		NumberValuePipe,
		CurrencyValuePipe,

		FieldModule,

		ExternalComponent,
		SubmittingComponent,
	],
	declarations: [
		ExternalComponent,
		SubmittingComponent,
	],
	providers: [],
})
export class BoardFormSharedModule {}
