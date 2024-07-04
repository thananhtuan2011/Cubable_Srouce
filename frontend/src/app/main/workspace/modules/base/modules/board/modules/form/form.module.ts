import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import {
	CurrencyValuePipe,
	NumberValuePipe
} from '@main/common/field/pipes';

import { CUBTabsModule } from '@cub/material/tabs';
import { CUBSwitchModule } from '@cub/material/switch';
import { CUBSearchBoxModule } from '@cub/material/search-box';
import { CUBListModule } from '@cub/material/list';
import { CUBMenuModule } from '@cub/material/menu';
import { CUBTooltipModule } from '@cub/material/tooltip';
import { CUBIconModule } from '@cub/material/icon';
import { CUBImageModule } from '@cub/material/image';
import { CUBPalettePipe } from '@cub/pipes';

import { ComparisonModule } from '@main/common/field/modules/comparison/comparison.module';
import { LogicEditorModule } from '@main/common/logic-editor/logic-editor.module';
import { InputModule } from '@main/common/field/modules/input/input.module';

import {
	FormViewModule
} from '../view/modules/form-view/fom-view.module';
import {
	CommonModule
} from '../../../workflow/modules/setup/modules/common/common.module';

import {
	BoardFormComponent,
	EditingComponent,
	BuilderComponent,
	InternalComponent,
	SettingComponent,
	SidebarComponent
} from './components';

import {
	BoardFormSharedModule
} from './form-shared.module';


@NgModule({
	imports: [
		DragDropModule,

		CUBTabsModule,
		CUBSwitchModule,
		CUBSearchBoxModule,
		CUBTooltipModule,
		CUBListModule,
		CUBMenuModule,

		FormViewModule,
		BoardFormSharedModule,
		ComparisonModule,
		LogicEditorModule,
		InputModule,

		CommonModule,
	],
	exports: [
		BoardFormComponent,
		BuilderComponent,
		InternalComponent,
		EditingComponent,
		SettingComponent,
		CUBImageModule,
		CUBIconModule,

		CUBPalettePipe,
		NumberValuePipe,
		CurrencyValuePipe,
	],
	declarations: [
		BoardFormComponent,
		BuilderComponent,
		InternalComponent,
		EditingComponent,
		SettingComponent,
		SidebarComponent,
	],
	providers: [],
})
export class BoardFormModule {}
