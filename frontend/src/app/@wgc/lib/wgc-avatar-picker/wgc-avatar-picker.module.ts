import { ModuleWithProviders, NgModule, Type } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIFileService, WGC_FILE_SERVICE } from '../wgc-file-picker';
import { WGCAvatarModule } from '../wgc-avatar';
import { WGCButtonModule } from '../wgc-button';
import { WGCColorPickerModule } from '../wgc-color-picker';
import { WGCCropperModule } from '../wgc-cropper';
import { WGCDialogModule } from '../wgc-dialog';
import { WGCEmojiPickerModule } from '../wgc-emoji-picker';
import { WGCIconModule } from '../wgc-icon';
import { WGCMenuModule } from '../wgc-menu';
import { WGCRadioModule } from '../wgc-radio';
import { WGCToastModule } from '../wgc-toast';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCAvatarPickerComponent } from './wgc-avatar-picker.component';

@NgModule({
	imports: [
		CoreModule,

		WGCAvatarModule, WGCButtonModule, WGCColorPickerModule,
		WGCCropperModule, WGCDialogModule, WGCEmojiPickerModule,
		WGCIconModule, WGCMenuModule, WGCRadioModule,
		WGCToastModule, WGCTooltipModule, WGCTruncateModule,
	],
	exports		: [ WGCAvatarPickerComponent ],
	declarations: [ WGCAvatarPickerComponent ],
})
export class WGCAvatarPickerModule {

	/**
	 * @constructor
	 * @param {Type<WGCIFileService>} fileService
	 */
	public static forChild( fileService: Type<WGCIFileService> ): ModuleWithProviders<WGCAvatarPickerModule> {
		return {
			ngModule	: WGCAvatarPickerModule,
			providers	: [{ provide: WGC_FILE_SERVICE, useClass: fileService }],
		};
	}

}
