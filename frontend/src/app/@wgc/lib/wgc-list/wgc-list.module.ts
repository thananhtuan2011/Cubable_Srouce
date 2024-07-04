import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CoreModule, FormModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCScrollBarModule } from '../wgc-scroll-bar';
import { WGCColorPickerModule } from '../wgc-color-picker';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCInlineInputModule } from '../wgc-inline-input';
import { WGCButtonModule } from '../wgc-button';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCListComponent } from './list/wgc-list.component';
import { WGCListItemComponent } from './list-item/wgc-list-item.component';

@NgModule({
	imports: [
		DragDropModule,

		CoreModule, FormModule,

		WGCIconModule, WGCScrollBarModule, WGCColorPickerModule,
		WGCTruncateModule, WGCInlineInputModule, WGCButtonModule,
		WGCTooltipModule,
	],
	exports		: [ WGCListComponent, WGCListItemComponent ],
	declarations: [ WGCListComponent, WGCListItemComponent ],
	providers	: [],
})
export class WGCListModule {}
