import { NgModule } from '@angular/core';

import {
	CoreModule,
	I18nLazyTranslateModule,
	FormModule
} from '@core';

import { CUBIconModule } from '@cub/material/icon';
import { CUBImageModule } from '@cub/material/image';
import { CUBSearchBoxModule } from '@cub/material/search-box';
import { CUBCheckboxModule } from '@cub/material/checkbox';
import { CUBTooltipModule } from '@cub/material/tooltip';
import { CUBFormFieldModule } from '@cub/material/form-field';
import { CUBScrollBarModule } from '@cub/material/scroll-bar';
import { CUBAvatarModule } from '@cub/material/avatar';
import { CUBChipModule } from '@cub/material/chip';
import { CUBMemberPickerModule } from '@cub/material/member-picker';
import { CUBDropdownModule } from '@cub/material/dropdown';
import { CUBDatePickerModule } from '@cub/material/date-picker';
import { CUBSliderModule } from '@cub/material/slider';
import { CUBRatingModule } from '@cub/material/rating';
import { CUBPhoneFieldModule } from '@cub/material/phone-field';
import { CUBButtonModule } from '@cub/material/button';

import {
	CurrencyValuePipe,
	DateValuePipe,
	FieldMetadataPipe
} from '@main/common/field/pipes';
import {
	NavigationBarModule
} from '@main/common/navigation-bar/navigation-bar.module';
import { EditorModule } from '@main/common/field/modules/editor/editor.module';
import { InputModule } from '@main/common/field/modules/input/input.module';

import { ViewLayoutService } from '../../../view/services';

import {
	ExternalComponent,
	FieldInformationComponent
} from './components';
import { RecordDetailRoutingModule } from './detail-routing.module';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'RECORD.DETAIL',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBIconModule,
		CUBImageModule,
		CUBSearchBoxModule,
		CUBCheckboxModule,
		CUBTooltipModule,
		CUBFormFieldModule,
		CUBScrollBarModule,
		CUBAvatarModule,
		CUBChipModule,
		CUBMemberPickerModule,
		CUBDropdownModule,
		CUBDatePickerModule,
		CUBSliderModule,
		CUBRatingModule,
		CUBPhoneFieldModule,
		CUBButtonModule,

		FieldMetadataPipe,
		DateValuePipe,
		CurrencyValuePipe,
		InputModule,

		RecordDetailRoutingModule,

		NavigationBarModule,
		EditorModule,
	],
	exports: [
		CUBImageModule,
		CUBSearchBoxModule,
		CUBCheckboxModule,
		CUBTooltipModule,
		CUBIconModule,
		CUBFormFieldModule,
		CUBScrollBarModule,
		CUBAvatarModule,
		CUBChipModule,
		CUBMemberPickerModule,

		FieldMetadataPipe,
		DateValuePipe,
		CurrencyValuePipe,

		InputModule,

		ExternalComponent,
		FieldInformationComponent,
	],
	declarations: [
		ExternalComponent,
		FieldInformationComponent,
	],
	providers: [
		ViewLayoutService,
	],
})
export class RecordDetailSharedModule {}
