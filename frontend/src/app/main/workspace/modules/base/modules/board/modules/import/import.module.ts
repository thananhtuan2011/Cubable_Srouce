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
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBCheckboxModule
} from '@cub/material/checkbox';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBDrawerModule
} from '@cub/material/drawer';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBImageModule
} from '@cub/material/image';
import {
	CUBListModule
} from '@cub/material/list';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBPopupModule
} from '@cub/material/popup';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBSearchBoxModule
} from '@cub/material/search-box';
import {
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBColorPickerModule
} from '@cub/material/color-picker';

import {
	ComparisonModule
} from '@main/common/field/modules/comparison/comparison.module';
import {
	SpreadsheetModule
} from '@main/common/spreadsheet/spreadsheet.module';
import {
	FieldModule
} from '@main/common/field/field.module';
import {
	LogicEditorModule
} from '@main/common/logic-editor/logic-editor.module';
import {
	FieldMetadataPipe
} from '@main/common/field/pipes';

import {
	DialogPreviewComponent,
	OverlayLoadingComponent,
	PaginationComponent,
	PopupImportComponent
} from './components';
import {
	ImportCSVService,
	ImportXLSXService,
	ImportService,
	ImportSpreadsheetsService,
	ExportFileService,
	ImportValidateService,
	ImportApiService
} from './services';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		DragDropModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.IMPORT',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBChipModule,
		CUBSwitchModule,
		CUBTooltipModule,
		CUBIconModule,
		CUBButtonModule,
		CUBCheckboxModule,
		CUBDividerModule,
		CUBImageModule,
		CUBSearchBoxModule,
		CUBFormFieldModule,
		CUBMenuModule,
		CUBScrollBarModule,
		CUBDrawerModule,
		CUBListModule,
		CUBPopupModule,
		CUBDropdownModule,
		CUBLoadingModule,
		CUBSliderModule,
		CUBColorPickerModule,
		CUBAvatarModule,

		FieldMetadataPipe,

		FieldModule,
		ComparisonModule,
		LogicEditorModule,
		SpreadsheetModule,
	],
	exports: [
		DialogPreviewComponent,
		PopupImportComponent,
		PaginationComponent,
		OverlayLoadingComponent,
	],
	declarations: [
		DialogPreviewComponent,
		PopupImportComponent,
		PaginationComponent,
		OverlayLoadingComponent,
	],
	providers: [
		ImportApiService,
		ImportService,
		ImportCSVService,
		ImportXLSXService,
		ImportSpreadsheetsService,
		ImportValidateService,
		ExportFileService,
	],
})
export class ImportModule {}
