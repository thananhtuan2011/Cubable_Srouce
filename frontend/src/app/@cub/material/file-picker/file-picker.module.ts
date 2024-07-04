import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from 'angular-core';

import { CUBButtonModule } from '../button';
import { CUBFormFieldModule } from '../form-field';
import { CUBIconModule } from '../icon';
import { CUBImageModule } from '../image';
import { CUBListModule } from '../list';
import { CUBPopupModule } from '../popup';
import { CUBTooltipModule } from '../tooltip';

import { CUBFileComponent } from './file/file.component';

import {
	CUBFileItemComponent
} from './file-list/file-item.component';
import {
	CUBFileListComponent
} from './file-list/file-list.component';

import {
	CUBFileManagerComponent
} from './file-manager/file-manager.component';
import {
	CUBFileManagerService
} from './file-manager/file-manager.service';

import {
	CUBDropboxFilePickerComponent
} from './file-picker/dropbox/dropbox-file-picker.component';
import {
	CUBGoogleDriveFilePickerComponent
} from './file-picker/google-drive/google-drive-file-picker.component';
import {
	CUBLocalFilePickerComponent
} from './file-picker/local/local-file-picker.component';
import {
	CUBOneDriveFilePickerComponent
} from './file-picker/one-drive/one-drive-file-picker.component';
import {
	CUBFilePickerComponent
} from './file-picker/file-picker.component';
import {
	CUBFilePickerDirective
} from './file-picker/file-picker.directive';
import {
	CUBFilePickerService
} from './file-picker/file-picker.service';

import {
	CUBFilePreviewerComponent
} from './file-previewer/file-previewer.component';
import {
	CUBFilePreviewerService
} from './file-previewer/file-previewer.service';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBImageModule,
		CUBListModule,
		CUBPopupModule,
		CUBTooltipModule,
	],
	exports: [
		CUBFileComponent,

		CUBFileItemComponent,
		CUBFileListComponent,

		CUBFilePickerDirective,
	],
	declarations: [
		CUBFileComponent,

		CUBFileItemComponent,
		CUBFileListComponent,

		CUBDropboxFilePickerComponent,
		CUBFileManagerComponent,
		CUBFilePickerComponent,
		CUBFilePickerDirective,
		CUBGoogleDriveFilePickerComponent,
		CUBLocalFilePickerComponent,
		CUBOneDriveFilePickerComponent,

		CUBFilePreviewerComponent,
	],
	providers: [
		CUBFileManagerService,
		CUBFilePickerService,
		CUBFilePreviewerService,
	],
})
export class CUBFilePickerModule {}
