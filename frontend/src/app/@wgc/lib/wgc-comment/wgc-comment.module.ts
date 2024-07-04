import { NgModule, ModuleWithProviders, Type } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCAvatarModule } from '../wgc-avatar';
import { WGCButtonModule } from '../wgc-button';
import { WGCCardModule } from '../wgc-card';
import { WGCColorPickerModule } from '../wgc-color-picker';
import { WGCDividerModule } from '../wgc-divider';
import { WGCEmojiPickerModule } from '../wgc-emoji-picker';
import { WGCFilePickerModule, WGC_FILE_SERVICE, WGCIFileService } from '../wgc-file-picker';
import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCIconModule } from '../wgc-icon';
import { WGCLoadingModule } from '../wgc-loading';
import { WGCMemberPickerModule } from '../wgc-member-picker';
import { WGCMenuModule } from '../wgc-menu';
import { WGCScrollBarModule } from '../wgc-scroll-bar';
import { WGCSearchBoxModule } from '../wgc-search-box';
import { WGCShowMoreModule } from '../wgc-show-more';
import { WGCTabsModule } from '../wgc-tabs';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCTruncateModule } from '../wgc-truncate';

import { WGCCommentAttachmentListComponent } from './wgc-comment-attachment-list/wgc-comment-attachment-list.component';
import { WGCCommentBoxComponent, WGC_LINK_SERVICE, WGCILinkService } from './wgc-comment-box/wgc-comment-box.component';
import { WGCCommentContentComponent } from './wgc-comment-content/wgc-comment-content.component';
import { WGCCommentImageListComponent } from './wgc-comment-image-list/wgc-comment-image-list.component';
import { WGCCommentLinkListComponent } from './wgc-comment-link-list/wgc-comment-link-list.component';
import { WGCCommentListComponent } from './wgc-comment-list/wgc-comment-list.component';
import { WGCDialogReactionComponent } from './wgc-dialog-reaction/wgc-dialog-reaction.component';
import { WGCDialogCommentHistoryComponent } from './wgc-dialog-comment-history/wgc-dialog-comment-history.component';

@NgModule({
	imports: [
		CoreModule, FormModule,

		WGCAvatarModule, WGCButtonModule, WGCCardModule,
		WGCColorPickerModule, WGCDividerModule,
		WGCEmojiPickerModule, WGCFilePickerModule, WGCFormFieldModule,
		WGCIconModule, WGCLoadingModule, WGCMemberPickerModule,
		WGCMenuModule, WGCScrollBarModule, WGCSearchBoxModule,
		WGCShowMoreModule, WGCTabsModule, WGCTooltipModule,
		WGCTruncateModule,
	],
	exports: [
		WGCCommentAttachmentListComponent, WGCCommentBoxComponent, WGCCommentContentComponent,
		WGCCommentImageListComponent, WGCCommentLinkListComponent, WGCCommentListComponent,
		WGCDialogReactionComponent, WGCDialogCommentHistoryComponent,
	],
	declarations: [
		WGCCommentAttachmentListComponent, WGCCommentBoxComponent, WGCCommentContentComponent,
		WGCCommentImageListComponent, WGCCommentLinkListComponent, WGCCommentListComponent,
		WGCDialogReactionComponent, WGCDialogCommentHistoryComponent,
	],
	providers: [],
})
export class WGCCommentModule {

	/**
	 * @constructor
	 * @param {Type<WGCIFileService>} fileService
	 * @param {Type<WGCILinkService>} linkService
	 */
	public static forChild(
		fileService: Type<WGCIFileService>,
		linkService: Type<WGCILinkService>
	): [ ModuleWithProviders<WGCCommentModule>, ModuleWithProviders<WGCFilePickerModule> ] {
		return [
			{
				ngModule: WGCCommentModule,
				providers: [
					{ provide: WGC_FILE_SERVICE, useClass: fileService },
					{ provide: WGC_LINK_SERVICE, useClass: linkService },
				],
			},
			WGCFilePickerModule.forChild( fileService ),
		];
	}

}
