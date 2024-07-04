import {
	ModuleWithProviders,
	NgModule,
	inject
} from '@angular/core';
import {
	BrowserModule
} from '@angular/platform-browser';
import {
	ServiceWorkerModule as SWModule
} from '@angular/service-worker';
import {
	BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	CONSTANT,
	CoreModule,
	I18nLazyTranslateModule,
	ServiceWorkerService
} from '@core';

import {
	CUBModule
} from '@cub/cub.module';
import {
	CUB_FILE_SERVICE,
	CUB_GOOGLE_CLIENT_ID,
	CUB_LOCAL_FILE_SIZE_LIMIT,
	CUB_MICROSOFT_CLIENT_ID,
	CUB_MICROSOFT_REDIRECT_URL
} from '@cub/material/file-picker';

import {
	ErrorModule
} from '@error/error.module';

import {
	WGCModule
} from '@wgc/wgc.module';
import {
	WGCToastModule
} from '@wgc/wgc-toast';

import {
	File2Service
} from '@main/common/shared/services';
import {
	AuthModule
} from '@main/auth/auth.module';

import {
	GuidelineModule
} from './@guideline/guideline.module'; // Temp
import {
	DemoModule
} from './@demo/demo.module'; // Temp

import {
	AppRoutingModules
} from './app-routing.module';
import {
	AppComponent
} from './app.component';
import {
	UserSharedModule
} from './main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/user-shared.module';
import {
	BoardFormSharedModule
} from './main/workspace/modules/base/modules/board/modules/form/form-shared.module';
import {
	RecordDetailSharedModule
} from './main/workspace/modules/base/modules/board/modules/record/modules/detail/detail-shared.module';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ServiceWorkerModule: ModuleWithProviders<SWModule>
	= SWModule.register(
		'ngsw-worker.js',
		{ enabled: ENVIRONMENT.PRODUCTION }
	);

@NgModule({
	imports: [
		CoreModule,
		BrowserModule,
		BrowserAnimationsModule,

		I18nLazyTranslateModule.forRoot({
			prefix: 'APP',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBModule,

		ErrorModule,

		WGCModule,
		WGCToastModule,

		AuthModule,
		UserSharedModule,
		BoardFormSharedModule,
		RecordDetailSharedModule,

		GuidelineModule, // Temp
		DemoModule, // Temp

		AppRoutingModules,

		ServiceWorkerModule,
	],
	declarations: [
		AppComponent,
	],
	providers: [
		{
			provide: CUB_FILE_SERVICE,
			useClass: File2Service,
		},
		{
			provide: CUB_GOOGLE_CLIENT_ID,
			useValue: ENVIRONMENT.GOOGLE_CLIENT_ID,
		},
		{
			provide: CUB_LOCAL_FILE_SIZE_LIMIT,
			useValue: CONSTANT.ALLOW_FILE_SIZE,
		},
		{
			provide: CUB_MICROSOFT_CLIENT_ID,
			useValue: ENVIRONMENT.MICROSOFT_CLIENT_ID,
		},
		{
			provide: CUB_MICROSOFT_REDIRECT_URL,
			useValue: ENVIRONMENT.APP_URL,
		},
	],
	bootstrap: [ AppComponent ],
})
export class AppModule {

	private _serviceWorkerService: ServiceWorkerService
		= inject( ServiceWorkerService );

	constructor() {
		// Update available version
		this._serviceWorkerService.updateAvailableVersion();
	}

}
