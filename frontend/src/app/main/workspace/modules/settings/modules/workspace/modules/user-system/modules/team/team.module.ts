import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	TeamService
} from './services';
import {
	PopupTeamComponent,
	TeamComponent
} from './components';

@NgModule({
	imports: [
		CoreModule, ScrollingModule, FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),
		ScrollingModule,
		CUBMenuModule,
		CUBDividerModule,
		CUBMemberPickerModule,
		CUBButtonModule,
		CUBPopupModule,
		CUBDropdownModule,
		CUBIconModule,
		CUBFormFieldModule,
		CUBCheckboxModule,
		FormModule,
		CUBTooltipModule,
		CUBChipModule,
		CUBAvatarModule,
		CUBScrollBarModule,
		CUBSwitchModule,
	],
	exports: [
		TeamComponent,
	],
	declarations: [
		PopupTeamComponent,
		TeamComponent,
	],
	providers: [ TeamService ],
})
export class TeamModule {}
