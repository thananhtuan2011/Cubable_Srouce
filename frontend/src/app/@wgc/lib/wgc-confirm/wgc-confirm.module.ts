import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';
import { WGCTruncateModule } from '../wgc-truncate';

import { WGCConfirmComponent } from './wgc-confirm.component';
import { WGCConfirmService } from './wgc-confirm.service';

@NgModule({
	imports: [
		CoreModule,

		WGCButtonModule, WGCIconModule, WGCTruncateModule,
	],
	exports		: [ WGCConfirmComponent ],
	declarations: [ WGCConfirmComponent ],
	providers	: [ WGCConfirmService ],
})
export class WGCConfirmModule {}
