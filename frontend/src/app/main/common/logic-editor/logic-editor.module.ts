import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBClipboardCopyModule
} from '@cub/material/clipboard-copy';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBListModule
} from '@cub/material/list';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBChipModule
} from '@cub/material/chip';

import {
	FieldMetadataPipe
} from '@main/common/field/pipes';

import {
	ExpressionEditorComponent,
	FormulaEditorComponent,
	SyntaxEditorComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'LOGIC_EDITOR',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBClipboardCopyModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBListModule,
		CUBLoadingModule,
		CUBScrollBarModule,
		CUBTooltipModule,
		CUBChipModule,

		FieldMetadataPipe,
	],
	exports: [
		ExpressionEditorComponent,
		FormulaEditorComponent,
		SyntaxEditorComponent,
	],
	declarations: [
		ExpressionEditorComponent,
		FormulaEditorComponent,
		SyntaxEditorComponent,
	],
	providers: [],
})
export class LogicEditorModule {}
