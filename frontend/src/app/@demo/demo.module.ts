import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { CUBPreloadModule } from '@cub/cub.preload.module';

import { FieldModule } from '@main/common/field/field.module';
import { SpreadsheetModule } from '@main/common/spreadsheet/spreadsheet.module';

import { EditorDemoComponent } from './editor-demo.component';
import { SpreadsheetDemoComponent } from './spreadsheet-demo.component';

import { routing } from './demo.routing';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBPreloadModule,

		FieldModule,
		SpreadsheetModule,

		routing,
	],
	exports: [],
	declarations: [
		EditorDemoComponent,
		SpreadsheetDemoComponent,
	],
	providers: [],
})
export class DemoModule {}
