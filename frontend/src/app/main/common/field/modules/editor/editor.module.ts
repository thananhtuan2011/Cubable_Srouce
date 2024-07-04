import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBEditorModule
} from '@cub/material/editor';
import {
	CUBExpansionPanelModule
} from '@cub/material/expansion-panel';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBSwitchModule
} from '@cub/material/switch';

import {
	LogicEditorModule
} from '@main/common/logic-editor/logic-editor.module';

import {
	BuilderSharedModule
} from '../../modules/builder/builder.shared.module';

import {
	FieldMetadataPipe
} from '../../pipes';

import {
	FormulaDataEditorComponent,
	LinkEditorComponent,
	LinkEditorService,
	RichTextEditorComponent,
	RichTextEditorService,
	FormulaEditorService,
	FormulaPopupComponent
} from './components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule
		.forChild({
			prefix: 'FIELD.EDITOR',
			loader: ( lang: string ) => {
				return import(
					`./i18n/${lang}.json`
				);
			},
		}),

		CUBButtonModule,
		CUBDropdownModule,
		CUBEditorModule,
		CUBExpansionPanelModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBMenuModule,
		CUBPopupModule,
		CUBSwitchModule,

		LogicEditorModule,

		BuilderSharedModule,

		FieldMetadataPipe,
	],
	exports: [
		FormulaDataEditorComponent,
	],
	declarations: [
		FormulaDataEditorComponent,
		FormulaPopupComponent,
		LinkEditorComponent,
		RichTextEditorComponent,
	],
	providers: [
		LinkEditorService,
		RichTextEditorService,
		FormulaEditorService,
	],
})
export class EditorModule {}
