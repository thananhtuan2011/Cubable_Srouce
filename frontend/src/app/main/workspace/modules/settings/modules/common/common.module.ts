import { NgModule } from '@angular/core';

import { CoreModule, I18nLazyTranslateModule } from '@core';

import { WGCButtonModule } from '@wgc/wgc-button';
import { WGCDialogModule } from '@wgc/wgc-dialog';
import { WGCTruncateModule } from '@wgc/wgc-truncate';

// import { NotificationModule } from './modules/notification/notification.module';
// import { TransferAssetsModule } from './modules/transfer-assets/transfer-assets.module';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'SETTINGS.COMMON',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		WGCButtonModule,

		// NotificationModule, TransferAssetsModule,
	],
	exports: [
		WGCButtonModule, WGCDialogModule, WGCTruncateModule,

		// NotificationModule, TransferAssetsModule,
	],
	declarations: [],
	providers	: [],
})
export class CommonModule {}
