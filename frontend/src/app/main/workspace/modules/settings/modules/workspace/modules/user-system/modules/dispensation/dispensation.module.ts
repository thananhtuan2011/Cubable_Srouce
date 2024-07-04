import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

// import {
// 	DialogRoleComponent,
// 	DispensationComponent,
// 	PermissionComponent,
// 	RoleComponent
// } from './components';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBMemberPickerModule
} from '@cub/material/member-picker';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBConfirmModule
} from '@cub/material/confirm';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';

import {
	RoleService
} from './services';
import {
	RoleComponent
} from './components';

@NgModule({
	imports: [
		CoreModule, FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBDividerModule,
		CUBCardModule,
		CUBIconModule,
		CUBButtonModule,
		CUBMemberPickerModule,
		CUBSwitchModule,
		CUBPopupModule,
		CUBCheckboxModule,
		CUBScrollBarModule,
		CUBConfirmModule,
		CUBTooltipModule,
	],
	exports: [
		RoleComponent,
		// DispensationComponent, PermissionComponent, RoleComponent,
		// DialogRoleComponent,
	],
	declarations: [
		RoleComponent,
		// DispensationComponent, PermissionComponent, RoleComponent,
		// DialogRoleComponent,
	],
	providers: [ RoleService ],
})
export class DispensationModule {}
