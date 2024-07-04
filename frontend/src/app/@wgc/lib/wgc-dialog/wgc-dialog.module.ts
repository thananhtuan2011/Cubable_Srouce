import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCDialogContainerComponent } from './dialog-container/wgc-dialog-container.component';
import { WGCDialogHeaderDirective } from './dialog-header/wgc-dialog-header.directive';
import { WGCDialogContentDirective } from './dialog-content/wgc-dialog-content.directive';
import { WGCDialogFooterDirective } from './dialog-footer/wgc-dialog-footer.directive';
import { WGCDialogService } from './dialog/wgc-dialog.service';

@NgModule({
	imports: [
		OverlayModule, PortalModule,

		CoreModule,

		WGCButtonModule, WGCTooltipModule,
	],
	exports		: [ WGCDialogContainerComponent, WGCDialogHeaderDirective, WGCDialogContentDirective, WGCDialogFooterDirective ],
	declarations: [ WGCDialogContainerComponent, WGCDialogHeaderDirective, WGCDialogContentDirective, WGCDialogFooterDirective ],
	providers	: [ WGCDialogService ],
})
export class WGCDialogModule {}
