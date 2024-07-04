import {
	NgModule
} from '@angular/core';
import {
	DragDropModule
} from '@angular/cdk/drag-drop';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBIconModule
} from '@cub/material/icon';

import {
	ComparisonModule
} from '@main/common/field/modules/comparison/comparison.module';
import {
	LogicEditorModule
} from '@main/common/logic-editor/logic-editor.module';
import {
	FieldMetadataPipe
} from '@main/common/field/pipes';

import {
	NumbersOnlyDirective
} from '../../directives/number-parser.directive';
import {
	SelectBoardComponent
} from './select-board/select-board.component';
import {
	SingleConditionalComponent,
	GroupConditionalComponent,
	FieldPickerComponent
} from './conditional';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		DragDropModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.COMMON',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBCardModule,
		CUBDropdownModule,
		CUBIconModule,
		CUBDropdownModule,

		ComparisonModule,

		LogicEditorModule,

		FieldMetadataPipe,
	],
	exports: [
		SelectBoardComponent,
		SingleConditionalComponent,
		GroupConditionalComponent,
		NumbersOnlyDirective,
	],
	declarations: [
		SelectBoardComponent,
		SingleConditionalComponent,
		GroupConditionalComponent,
		FieldPickerComponent,
		NumbersOnlyDirective,
	],
	providers: [],
})
export class CommonModule {}
