import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCButtonModule } from '../wgc-button';

import { WGCToastComponent } from './toast/wgc-toast.component';
import { WGCToastGroupComponent } from './toast-group/wgc-toast-group.component';
import { WGCToastService } from './toast/wgc-toast.service';

@NgModule({
	imports: [
		OverlayModule, PortalModule,

		CoreModule,

		WGCIconModule, WGCButtonModule,
	],
	exports		: [ WGCToastComponent, WGCToastGroupComponent ],
	declarations: [ WGCToastComponent, WGCToastGroupComponent ],
	providers	: [ WGCToastService ],
})
export class WGCToastModule {}
