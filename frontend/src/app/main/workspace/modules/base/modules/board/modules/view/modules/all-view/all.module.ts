import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBButtonModule,
	CUBCardModule,
	CUBDividerModule,
	CUBIconModule,
	CUBMenuModule,
	CUBPopupModule,
	CUBScrollBarModule,
	CUBTabsModule,
	CUBTooltipModule
} from '@cub/material';
import { CUBPalettePipe } from '@cub/pipes';

import { DataViewModule } from '../data-view/data-view.module';
import { FormViewModule } from '../form-view/fom-view.module';

import { AllViewComponent } from './components';

@NgModule({
	imports: [
		CoreModule, FormModule, DragDropModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.VIEW.ALL',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBMenuModule,
		CUBTabsModule,
		CUBPopupModule,
		CUBTooltipModule,
		CUBDividerModule,
		CUBIconModule,
		CUBCardModule,
		CUBScrollBarModule,

		CUBPalettePipe,

		DataViewModule, FormViewModule,
	],
	exports: [ AllViewComponent ],
	declarations: [ AllViewComponent ],
	providers: [],
})
export class AllViewModule {}
