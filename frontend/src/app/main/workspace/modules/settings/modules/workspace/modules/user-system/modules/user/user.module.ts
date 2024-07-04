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
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBFromNowPipe
} from '@cub/pipes';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBActionBoxModule
} from '@cub/material/action-box';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';

import {
	FieldModule
} from '@main/common/field/field.module';

import {
	PopupResendInvitationComponent,
	UserComponent
} from './components';
import {
	UserSharedModule
} from './user-shared.module';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		ScrollingModule,

		CUBMenuModule,
		CUBDividerModule,
		CUBActionBoxModule,
		CUBIconModule,
		CUBAvatarModule,
		CUBTooltipModule,
		CUBCheckboxModule,
		CUBChipModule,
		CUBFromNowPipe,
		CUBScrollBarModule,

		FieldModule,
		UserSharedModule,
	],
	exports: [
		UserComponent,
		PopupResendInvitationComponent,
	],
	declarations: [
		UserComponent,
		PopupResendInvitationComponent,
	],
	providers: [],
})
export class UserModule {}
