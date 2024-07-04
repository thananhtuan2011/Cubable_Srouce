import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

import { I18nLazyTranslateModule } from '@core';

import { CUBClipboardCopyModule } from '@cub/material/clipboard-copy';
import { CUBPalettePipe } from '@cub/pipes/palette.pipe';

import { CommonModule } from '../common/common.module';

import {
	FormViewComponent,
	SharingFormComponent,
	SharingFormDirective
} from './components';
import { FormViewService } from './services';

@NgModule({
	imports: [
		QRCodeModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.BOARD.DETAIL.VIEW.FORM',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CommonModule,
		CUBClipboardCopyModule,

		CUBPalettePipe,
	],
	exports: [
		FormViewComponent,
		SharingFormComponent,
		SharingFormDirective,
	],
	declarations: [
		FormViewComponent,
		SharingFormComponent,
		SharingFormDirective,
	],
	providers: [ FormViewService ],
})
export class FormViewModule {}
