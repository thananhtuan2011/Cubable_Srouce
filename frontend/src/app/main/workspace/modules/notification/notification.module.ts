import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBDatePickerModule
} from '@cub/material/date-picker';
import {
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBRatingModule
} from '@cub/material/rating';
import {
	CUBPhoneFieldModule
} from '@cub/material/phone-field';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBTabsModule
} from '@cub/material/tabs';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBFilePickerModule
} from '@cub/material/file-picker';
import {
	CUBShowMoreModule
} from '@cub/material/show-more';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBEditorModule
} from '@cub/material/editor';
import {
	CUBListModule
} from '@cub/material/list';
import {
	CUBBadgeModule
} from '@cub/material/badge';
import {
	CUBFromNowPipe,
	CUBPalettePipe
} from '@cub/pipes';

import {
	CommentService
} from '../base/modules/board/modules/record/modules/detail/services';
import {
	BoardExpandService
} from '../base/modules/board/services';

import {
	NotificationComponent,
	DialogNotificationComponent,
	NotificationPageComponent,
	RecordNamePipe
} from './components';
import {
	NotificationRoutingModule
} from './notification-routing.module';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'NOTIFICATION',
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
		CUBTabsModule,
		CUBDividerModule,
		CUBFilePickerModule,
		CUBShowMoreModule,
		CUBMenuModule,
		CUBEditorModule,
		CUBListModule,
		CUBBadgeModule,

		NotificationRoutingModule,

		CUBPalettePipe,
		CUBFromNowPipe,
	],
	exports: [
		DialogNotificationComponent,
		NotificationComponent,
		NotificationPageComponent,
	],
	declarations: [
		DialogNotificationComponent,
		NotificationComponent,
		NotificationPageComponent,
		RecordNamePipe,
	],
	providers: [
		CommentService,
		BoardExpandService,
	],
})

export class NotificationModule {}
