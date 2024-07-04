import {
	NgModule
} from '@angular/core';

import {
	CoreModule, FormModule
} from '@core';

import {
	CUBFromNowPipe
} from '../../pipes';

import {
	CUBScrollBarModule
} from '../scroll-bar';
import {
	CUBButtonModule
} from '../button';
import {
	CUBIconModule
} from '../icon';
import {
	CUBLoadingModule
} from '../loading';
import {
	CUBFilePickerModule
} from '../file-picker';
import {
	CUBEmojiPickerModule
} from '../emoji-picker';
import {
	CUBMenuModule
} from '../menu';
import {
	CUBPopupModule
} from '../popup';
import {
	CUBCardModule
} from '../card';
import {
	CUBAvatarModule
} from '../avatar';
import {
	CUBTooltipModule
} from '../tooltip';
import {
	CUBFormFieldModule
} from '../form-field';
import {
	CUBMemberPickerModule
} from '../member-picker';
import {
	CUBClipboardCopyModule
} from '../clipboard-copy';
import {
	CUBEditorModule
} from '../editor';

import {
	CUBCommentBoxComponent
} from './comment-box/comment-box.component';
import {
	CUBCommentListComponent
} from './comment-list/comment-list.component';
import {
	CUBCommentContentComponent
} from './comment-content/comment-content.component';
import {
	CUBCommentAttachmentListComponent
} from './comment-attachment-list/comment-attachment-list.component';
import {
	CUBCommentLinkListComponent
} from './comment-link-list/comment-link-list.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBScrollBarModule,
		CUBButtonModule,
		CUBIconModule,
		CUBLoadingModule,
		CUBFilePickerModule,
		CUBEmojiPickerModule,
		CUBMenuModule,
		CUBPopupModule,
		CUBAvatarModule,
		CUBCardModule,
		CUBTooltipModule,
		CUBFormFieldModule,
		CUBMemberPickerModule,
		CUBClipboardCopyModule,
		CUBEditorModule,

		CUBFromNowPipe,
	],
	exports: [
		CUBCommentBoxComponent,
		CUBCommentListComponent,
		CUBCommentContentComponent,
		CUBCommentAttachmentListComponent,
		CUBCommentLinkListComponent,
	],
	declarations: [
		CUBCommentBoxComponent,
		CUBCommentListComponent,
		CUBCommentContentComponent,
		CUBCommentAttachmentListComponent,
		CUBCommentLinkListComponent,
	],
	providers: [],
})
export class CUBCommentModule {}
