import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule, FormModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCMenuModule } from '../wgc-menu';
import { WGCAvatarModule } from '../wgc-avatar';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCButtonModule } from '../wgc-button';

import { WGCSearchBoxComponent } from './wgc-search-box.component';

@NgModule({
	imports: [
		ScrollingModule,

		CoreModule, FormModule,

		WGCFormFieldModule, WGCIconModule, WGCMenuModule,
		WGCAvatarModule, WGCTruncateModule, WGCButtonModule,
	],
	exports		: [ WGCSearchBoxComponent ],
	declarations: [ WGCSearchBoxComponent ],
	providers	: [],
})
export class WGCSearchBoxModule {}
