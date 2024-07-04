import {
	NgModule
} from '@angular/core';
import {
	DragDropModule
} from '@angular/cdk/drag-drop';
import {
	ScrollingModule
} from '@angular/cdk/scrolling';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBActionBoxModule,
	CUBButtonModule,
	CUBCardModule,
	CUBCheckboxModule,
	CUBDividerModule,
	CUBDropdownModule,
	CUBFormFieldModule,
	CUBIconModule,
	CUBImageModule,
	CUBMemberPickerModule,
	CUBMenuModule,
	CUBPageModule,
	CUBPopupModule,
	CUBScrollBarModule,
	CUBSearchBoxModule,
	CUBTooltipModule
} from '@cub/material';

import {
	TeamModule
} from '../settings/modules/workspace/modules/user-system/modules/team/team.module';

import {
	BaseRoutingModule
} from './base-routing.module';
import {
	BaseComponent,
	BaseDisplayGridComponent,
	BaseDisplayTableComponent,
	DetailComponent
} from './components';
import {
	BaseExpandService,
	BaseService,
	BaseCategoryService,
	BaseRoleService
} from './services';
import {
	BoardModule
} from './modules/board/board.module';
import {
	RolePermissionModule
} from './modules/role-permission/role-permission.module';
import {
	WorkflowModule
} from './modules/workflow/workflow.module';

@NgModule({
	imports: [
		DragDropModule,
		ScrollingModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBDividerModule,
		CUBButtonModule,
		CUBCardModule,
		CUBIconModule,
		CUBScrollBarModule,
		CUBMenuModule,
		CUBTooltipModule,
		CUBFormFieldModule,
		CUBPageModule,
		CUBCheckboxModule,
		CUBSearchBoxModule,
		CUBActionBoxModule,
		CUBImageModule,
		CUBMemberPickerModule,
		CUBPopupModule,
		CUBDropdownModule,

		BoardModule,
		RolePermissionModule,
		WorkflowModule,
		TeamModule,

		BaseRoutingModule,
	],
	exports: [
		BaseComponent,
		BaseDisplayGridComponent,
		BaseDisplayTableComponent,
		DetailComponent,
	],
	declarations: [
		BaseComponent,
		BaseDisplayGridComponent,
		BaseDisplayTableComponent,
		DetailComponent,
	],
	providers: [
		BaseService,
		BaseCategoryService,
		BaseExpandService,
		BaseRoleService,
	],
})
export class BaseModule {}
