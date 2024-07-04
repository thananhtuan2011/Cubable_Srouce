import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCTruncateModule } from '../wgc-truncate';
import { WGCMenuModule } from '../wgc-menu';

import { WGCTagListComponent } from './tag-list/wgc-tag-list.component';
import { WGCTagComponent } from './tag/wgc-tag.component';

@NgModule({
	imports: [
		CoreModule,

		WGCTruncateModule, WGCMenuModule,
	],
	exports		: [ WGCTagListComponent, WGCTagComponent ],
	declarations: [ WGCTagListComponent, WGCTagComponent ],
	providers	: [],
})
export class WGCTagModule {}
