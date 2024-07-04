import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBDividerModule
} from '../divider';
import {
	CUBButtonModule
} from '../button';

import {
	CUBBasicEditorComponent
} from './basic-editor/editor.component';
import {
	CUBBasicEditorContentViewerComponent
} from './basic-editor/content-viewer.component';
import {
	CUBParagraphEditorComponent
} from './paragraph-editor/editor.component';

@NgModule({
	imports: [
		CoreModule,

		CUBDividerModule,
		CUBButtonModule,
	],
	exports: [
		CUBBasicEditorComponent,
		CUBBasicEditorContentViewerComponent,
		CUBParagraphEditorComponent,
	],
	declarations: [
		CUBBasicEditorComponent,
		CUBBasicEditorContentViewerComponent,
		CUBParagraphEditorComponent,
	],
})
export class CUBEditorModule {}
