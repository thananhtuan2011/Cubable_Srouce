import { NgModule } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ResizableModule } from 'angular-resizable-element';

import { CoreModule, FormModule } from '@core';

import { WGCMenuModule } from '../wgc-menu';
import { WGCIconModule } from '../wgc-icon';
import { WGCButtonModule } from '../wgc-button';
import { WGCSearchBoxModule } from '../wgc-search-box';
import { WGCDatePickerModule } from '../wgc-date-picker';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCTableComponent } from './table/wgc-table.component';
import { WGCCdkTableComponent } from './cdk-table/wgc-cdk-table.component';
import { WGCExcelTableComponent } from './excel-table/wgc-excel-table.component';
import { WGCExcelHeaderCellComponent } from './excel-table/wgc-excel-header-cell.component';
import { WGCExcelCellComponent } from './excel-table/wgc-excel-cell.component';

@NgModule({
	imports: [
		CdkTableModule, ResizableModule, ScrollingModule,

		CoreModule, FormModule,

		WGCMenuModule, WGCIconModule, WGCButtonModule,
		WGCSearchBoxModule, WGCDatePickerModule, WGCTruncateModule,
		WGCTooltipModule,
	],
	exports: [
		CdkTableModule,

		WGCTableComponent, WGCCdkTableComponent, WGCExcelTableComponent,
		WGCExcelHeaderCellComponent, WGCExcelCellComponent,
	],
	declarations: [
		WGCTableComponent, WGCCdkTableComponent, WGCExcelTableComponent,
		WGCExcelHeaderCellComponent, WGCExcelCellComponent,
	],
	providers: [],
})
export class WGCTableModule {}
