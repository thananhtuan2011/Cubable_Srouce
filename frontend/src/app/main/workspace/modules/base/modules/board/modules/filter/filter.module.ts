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
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBDividerModule
} from '@cub/material/divider';
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
	CUBCardModule
} from '@cub/material/card';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	LogicEditorModule
} from '@main/common/logic-editor/logic-editor.module';
import {
	ComparisonModule
} from '@main/common/field/modules/comparison/comparison.module';

import {
	FilterComponent
} from './components';

@NgModule({
	imports: [
		DragDropModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.FILTER',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBPopupModule,
		CUBButtonModule,
		CUBPalettePipe,
		CUBCardModule,
		CUBDropdownModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBDividerModule,

		ComparisonModule,
		LogicEditorModule,
	],
	exports: [ FilterComponent ],
	declarations: [ FilterComponent ],
	providers: [],
})
export class FilterModule {}
