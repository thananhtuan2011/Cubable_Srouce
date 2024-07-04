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
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBConfirmModule
} from '@cub/material/confirm';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBImageModule
} from '@cub/material/image';
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
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBButtonToggleModule
} from '@cub/material/button-toggle';
import {
	CUBBadgeModule
} from '@cub/material/badge';
import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	FieldModule
} from '@main/common/field/field.module';
import {
	SpreadsheetModule
} from '@main/common/spreadsheet/spreadsheet.module';

import {
	RecordComponent,
	RecordSpreadsheetComponent
} from './components';
import {
	RecordService
} from './services';
import {
	DetailModule
} from './modules/detail/detail.module';
import {
	ExportFileService
} from '../import/services';

@NgModule({
	imports: [
		DragDropModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.RECORD',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBConfirmModule,
		CUBIconModule,
		CUBMenuModule,
		CUBPopupModule,
		CUBScrollBarModule,
		CUBSearchBoxModule,
		CUBTooltipModule,
		CUBImageModule,
		CUBDropdownModule,
		CUBButtonToggleModule,
		CUBBadgeModule,

		CUBPalettePipe,

		FieldModule,
		SpreadsheetModule,

		DetailModule,
	],
	exports: [
		RecordComponent,
		RecordSpreadsheetComponent,
	],
	declarations: [
		RecordComponent,
		RecordSpreadsheetComponent,
	],
	providers: [
		RecordService,
		ExportFileService,
	],
})
export class RecordModule {}
