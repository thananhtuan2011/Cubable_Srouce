import { NgModule } from '@angular/core';

import { CoreModule, I18nLazyTranslateModule } from '@core';

import { WGCButtonModule } from '@wgc/wgc-button';
import { WGCIconModule } from '@wgc/wgc-icon';
import { WGCTooltipModule } from '@wgc/wgc-tooltip';

import {
	DialogLimitationWarningComponent,
	ErrorComponent,
	MaintenanceComponent
} from './components';
import { routing } from './error.routing';
import { ErrorService } from './services';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'ERROR',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		WGCButtonModule, WGCIconModule, WGCTooltipModule,

		routing,
	],
	exports		: [ DialogLimitationWarningComponent, ErrorComponent, MaintenanceComponent ],
	declarations: [ DialogLimitationWarningComponent, ErrorComponent, MaintenanceComponent ],
	providers	: [ ErrorService ],
})
export class ErrorModule {}
