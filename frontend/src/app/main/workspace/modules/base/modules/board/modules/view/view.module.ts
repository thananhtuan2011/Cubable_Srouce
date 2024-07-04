import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule as CoreFormModule,
	I18nLazyTranslateModule
} from '@core';

import { CUBPalettePipe } from '@cub/pipes/palette.pipe';
import { CUBScrollBarModule } from '@cub/material/scroll-bar';

import {
	CUBButtonModule,
	CUBDividerModule,
	CUBIconModule,
	CUBLoadingModule,
	CUBMenuModule
} from '@cub/material';

import { CommonModule } from './modules/common/common.module';
import { DataViewModule } from './modules/data-view/data-view.module';
import { AllViewModule } from './modules/all-view/all.module';
import { ViewComponent } from './components';
import { FormViewModule } from './modules/form-view/fom-view.module';
import {
	ViewLayoutService,
	ViewService
} from './services';

@NgModule({
	imports: [
		CoreModule,
		CoreFormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.VIEW',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBMenuModule,
		CUBDividerModule,
		CUBIconModule,
		CUBLoadingModule,
		CUBScrollBarModule,

		CUBPalettePipe,

		CommonModule,
		DataViewModule,
		FormViewModule,
		AllViewModule,
	],
	exports: [ ViewComponent ],
	declarations: [ ViewComponent ],
	providers: [
		ViewService,
		ViewLayoutService,
	],
})
export class ViewModule {}
