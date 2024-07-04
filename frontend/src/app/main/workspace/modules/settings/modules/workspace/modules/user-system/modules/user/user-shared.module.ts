import {
	NgModule
} from '@angular/core';
import {
	ScrollingModule
} from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBMultipleEmailInputModule
} from '@cub/material/multiple-email-input';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';

import {
	FieldModule
} from '@main/common/field/field.module';

import {
	RoleService
} from '../dispensation/services';
import {
	PopupInviteUserComponent
} from './components/popup-invite-user.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		ScrollingModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBPopupModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBMultipleEmailInputModule,
		CUBButtonModule,
		CUBTooltipModule,
		CUBMemberPickerModule,

		FieldModule,
	],
	exports: [
		CUBPopupModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBMultipleEmailInputModule,
		CUBButtonModule,
		CUBTooltipModule,
		CUBMemberPickerModule,

		PopupInviteUserComponent,
	],
	declarations: [
		PopupInviteUserComponent,
	],
	providers: [
		RoleService,
	],
})
export class UserSharedModule {}
