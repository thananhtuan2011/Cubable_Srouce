import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCTruncateModule } from '../wgc-truncate';

import { WGCGoogleDrivePickerDirective } from './google-drive/wgc-google-drive-picker.directive';
import { WGCDropboxPickerDirective } from './dropbox/wgc-dropbox-picker.directive';
import { WGCOneDrivePickerDirective } from './one-drive/wgc-one-drive-picker.directive';
import {
	WGC_CLOUD_STORAGE_CONFIG, WGCCloudStorageConfig,
	WGC_FILE_SERVICE, WGCIFileService,
	WGCFilePickerComponent
} from './wgc-file-picker.component';
import { WGCFilePickerDirective } from './wgc-file-picker.directive';

@NgModule({
	imports: [
		RoundProgressModule, OverlayModule, PortalModule,

		CoreModule,

		WGCIconModule, WGCButtonModule, WGCTruncateModule,
		WGCTooltipModule,
	],
	exports: [
		WGCGoogleDrivePickerDirective, WGCDropboxPickerDirective, WGCOneDrivePickerDirective,
		WGCFilePickerComponent, WGCFilePickerDirective,
	],
	declarations: [
		WGCGoogleDrivePickerDirective, WGCDropboxPickerDirective, WGCOneDrivePickerDirective,
		WGCFilePickerComponent, WGCFilePickerDirective,
	],
	providers: [{ provide: WGC_CLOUD_STORAGE_CONFIG, useClass: WGCCloudStorageConfig }],
})
export class WGCFilePickerModule {

	/**
	 * @constructor
	 * @param {Type<WGCIFileService>} fileService
	 */
	public static forChild( fileService: Type<WGCIFileService> ): ModuleWithProviders<WGCFilePickerModule> {
		return {
			ngModule	: WGCFilePickerModule,
			providers	: [{ provide: WGC_FILE_SERVICE, useClass: fileService }],
		};
	}

}
