// @ts-ignore
import { ModuleWithProviders } from '@angular/core';

import { WGCAvatarPickerModule } from '@wgc/wgc-avatar-picker';
import { WGCCommentModule } from '@wgc/wgc-comment';
import { WGCFilePickerModule } from '@wgc/wgc-file-picker';

import { FileService, GeneralService } from './shared/services';

export { WGCAvatarPickerModule } from '@wgc/wgc-avatar-picker';
export { WGCCommentModule } from '@wgc/wgc-comment';
export { WGCFilePickerModule } from '@wgc/wgc-file-picker';

/* eslint-disable @typescript-eslint/naming-convention */
export const WGCAvatarPickerModuleWithProviders: ReturnType<typeof WGCAvatarPickerModule.forChild>
	= WGCAvatarPickerModule.forChild( FileService );
export const WGCCommentModuleWithProviders: ReturnType<typeof WGCCommentModule.forChild>
	= WGCCommentModule.forChild( FileService, GeneralService );
export const WGCFilePickerModuleWithProviders: ReturnType<typeof WGCFilePickerModule.forChild>
	= WGCFilePickerModule.forChild( FileService );
/* eslint-enable @typescript-eslint/naming-convention */
