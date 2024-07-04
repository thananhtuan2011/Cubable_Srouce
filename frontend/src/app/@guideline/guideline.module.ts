import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';

import {
	CONSTANT,
	CoreModule,
	FormModule
} from '@core';

import { ENVIRONMENT } from '@environments/environment';

import {
	CUB_FILE_SERVICE,
	CUB_GOOGLE_CLIENT_ID,
	CUB_LOCAL_FILE_SIZE_LIMIT,
	CUB_MICROSOFT_CLIENT_ID,
	CUB_MICROSOFT_REDIRECT_URL
} from '@cub/material/file-picker';
import { CUBPreloadModule } from '@cub/cub.preload.module';

import { WGCPreloadModule } from '@wgc/wgc.preload.module';

import { File2Service } from '@main/common/shared/services';
// import { SpreadsheetModule } from '@main/common/spreadsheet/spreadsheet.module';
// import { FieldModule } from '@main/common/field/field.module';
// import { LogicEditorModule } from '@main/common/logic-editor/logic-editor.module';

// import { TestComponent } from './test.component';
// import { TestV2Component } from './test-v2.component';
import { routing } from './guideline.routing';
import { GuidelineComponent } from './guideline.component';
import { MyDialogComponent } from './my-dialog.component';

@NgModule({
	imports: [
		DragDropModule,
		// BrowserAnimationsModule,

		CoreModule,
		FormModule,

		CUBPreloadModule,

		WGCPreloadModule,

		routing,
	],
	exports: [],
	declarations: [
		GuidelineComponent,
		MyDialogComponent,
	],
	providers: [
		{ provide: CUB_FILE_SERVICE, useClass: File2Service },
		{ provide: CUB_GOOGLE_CLIENT_ID, useValue: ENVIRONMENT.GOOGLE_CLIENT_ID },
		{ provide: CUB_LOCAL_FILE_SIZE_LIMIT, useValue: CONSTANT.ALLOW_FILE_SIZE },
		{ provide: CUB_MICROSOFT_CLIENT_ID, useValue: ENVIRONMENT.MICROSOFT_CLIENT_ID },
		{ provide: CUB_MICROSOFT_REDIRECT_URL, useValue: ENVIRONMENT.APP_URL },
	],
})
export class GuidelineModule {}
