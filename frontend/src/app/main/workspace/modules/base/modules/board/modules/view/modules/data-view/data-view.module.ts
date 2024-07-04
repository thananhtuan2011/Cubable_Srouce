import { NgModule } from '@angular/core';

import { I18nLazyTranslateModule } from '@core';

import { CUBPalettePipe } from '@cub/pipes/palette.pipe';

import { FilterModule } from '@main/workspace/modules/base/modules/board/modules/filter/filter.module';

import { CommonModule } from '../common/common.module';

import { DataViewComponent } from './components';
import { DataViewService } from './services';


@NgModule({
	imports: [
		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.DETAIL.VIEW.DATA',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBPalettePipe,

		CommonModule,

		FilterModule,
	],
	exports: [ DataViewComponent ],
	declarations: [ DataViewComponent ],
	providers: [ DataViewService ],
})
export class DataViewModule {}
