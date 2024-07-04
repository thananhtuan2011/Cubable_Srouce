import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule,
	CUBCardModule,
	CUBCheckboxModule,
	CUBDividerModule,
	CUBDropdownModule,
	CUBFormFieldModule,
	CUBIconModule,
	CUBMemberPickerModule,
	CUBMenuModule,
	CUBPopupModule,
	CUBRadioModule,
	CUBScrollBarModule,
	CUBSearchBoxModule,
	CUBSwitchModule,
	CUBTooltipModule
} from '@cub/material';
import { CUBDialogModule } from '@cub/material/dialog';

import { FieldMetadataPipe } from '@main/common/field/pipes';
import { TeamModule } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/team.module';

import {
	DialogRolePermissionComponent,
	PermissionComponent,
	RoleComponent
} from './components';
import {
	ActionPermissionTranslatePipe,
	BoardPermissionTranslatePipe,
	RecordManageTypeTranslatePipe,
	ViewManageTranslatePipe,
	ViewAccessTranslatePipe,
	ActionFieldManageTranslatePipe,
	FieldManageTranslatePipe
} from './pipes';
import { RoleService } from './services';

import { CUBPalettePipe } from '@cub/pipes';

@NgModule({
	imports: [
		CoreModule, ScrollingModule, FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.ROLE_PERMISSION',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBPalettePipe, FieldMetadataPipe,

		CUBMemberPickerModule,
		CUBDialogModule,
		CUBButtonModule,
		CUBIconModule,
		CUBTooltipModule,
		CUBScrollBarModule,
		CUBCardModule,
		CUBSwitchModule,
		CUBMenuModule,
		CUBFormFieldModule,
		CUBPopupModule,
		CUBDropdownModule,
		CUBSearchBoxModule,
		CUBDividerModule,
		CUBRadioModule,
		CUBCheckboxModule,

		TeamModule,
	],
	exports: [
		DialogRolePermissionComponent,
		RoleComponent,
		BoardPermissionTranslatePipe,
		ActionPermissionTranslatePipe,
		PermissionComponent,
		RecordManageTypeTranslatePipe,
		ViewManageTranslatePipe,
		ViewAccessTranslatePipe,
		FieldManageTranslatePipe,
		ActionFieldManageTranslatePipe,

		CUBPalettePipe,
	],
	declarations: [
		DialogRolePermissionComponent,
		RoleComponent,
		BoardPermissionTranslatePipe,
		ActionPermissionTranslatePipe,
		PermissionComponent,
		RecordManageTypeTranslatePipe,
		ViewManageTranslatePipe,
		ViewAccessTranslatePipe,
		FieldManageTranslatePipe,
		ActionFieldManageTranslatePipe,
	],
	providers: [
		RoleService,
		BoardPermissionTranslatePipe,
		ActionPermissionTranslatePipe,
		RecordManageTypeTranslatePipe,
	],
})
export class RolePermissionModule {}
