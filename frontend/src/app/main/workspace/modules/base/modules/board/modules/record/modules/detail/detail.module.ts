import {
	NgModule
} from '@angular/core';
import {
	QRCodeModule
} from 'angularx-qrcode';

import {
	CoreModule,
	FormModule
} from '@core';

import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBClipboardCopyModule
} from '@cub/material/clipboard-copy';
import {
	CUBCommentModule
} from '@cub/material/comment';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';

import {
	CommentComponent,
	DialogDetailComponent,
	InformationComponent
} from './components';
import {
	RecordDetailSharedModule
} from './detail-shared.module';
import {
	CommentService
} from './services';

@NgModule({
	imports: [
		CoreModule,
		QRCodeModule,
		FormModule,

		CUBButtonModule,
		CUBMenuModule,
		CUBClipboardCopyModule,
		CUBCommentModule,
		CUBScrollBarModule,

		RecordDetailSharedModule,
	],
	exports: [
		DialogDetailComponent,
		InformationComponent,
		CommentComponent,
	],
	declarations: [
		DialogDetailComponent,
		InformationComponent,
		CommentComponent,
	],
	providers: [
		CommentService,
	],
})
export class DetailModule {}
