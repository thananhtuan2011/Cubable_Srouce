import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule,
	CUBDividerModule,
	CUBDrawerModule,
	CUBFormFieldModule,
	CUBIconModule,
	CUBListModule,
	CUBMenuModule,
	CUBPopupModule,
	CUBScrollBarModule,
	CUBSearchBoxModule,
	CUBTooltipModule
} from '@cub/material';

import { FieldModule } from '@main/common/field/field.module';

import {
	BoardComponent,
	DetailComponent
} from './components';
import {
	BoardExpandService,
	BoardFieldService,
	BoardService
} from './services';
import { ViewModule } from './modules/view/view.module';
import { RecordModule } from './modules/record/record.module';
import { BoardFormModule } from './modules/form/form.module';
import { ImportModule } from './modules/import/import.module';


@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBSearchBoxModule,
		CUBFormFieldModule,
		CUBButtonModule,
		CUBIconModule,
		CUBTooltipModule,
		CUBMenuModule,
		CUBDrawerModule,
		CUBScrollBarModule,
		CUBDividerModule,
		CUBListModule,
		CUBPopupModule,

		FieldModule,

		ViewModule,
		RecordModule,
		BoardFormModule,
		ImportModule,
	],
	exports: [
		BoardComponent,
		DetailComponent,
	],
	declarations: [
		BoardComponent,
		DetailComponent,
	],
	providers: [
		BoardService,
		BoardFieldService,
		BoardExpandService,
	],
})
export class BoardModule {}
