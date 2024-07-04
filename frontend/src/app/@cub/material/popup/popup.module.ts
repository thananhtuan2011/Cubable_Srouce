import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule } from 'angular-core';

import { CUBScrollBarModule } from '../scroll-bar';

import { CUBPopupComponent } from './popup/popup.component';
import { CUBPopupContentComponent } from './popup/popup-content/popup-content.component';
import { CUBPopupContentDirective } from './popup/popup-content/popup-content.directive';
import { CUBPopupFooterComponent } from './popup/popup-footer/popup-footer.component';
import { CUBPopupFooterDirective } from './popup/popup-footer/popup-footer.directive';
import { CUBPopupHeaderComponent } from './popup/popup-header/popup-header.component';
import { CUBPopupHeaderDirective } from './popup/popup-header/popup-header.directive';
import { CUBPopupTriggerForDirective } from './popup-trigger-for/popup-trigger-for.directive';
import { CUBPopupService } from './popup-trigger-for/popup.service';

@NgModule({
	imports: [
		DragDropModule,
		OverlayModule,
		PortalModule,
		ScrollingModule,

		CoreModule,

		CUBScrollBarModule,
	],
	exports: [
		CUBPopupComponent,
		CUBPopupContentComponent,
		CUBPopupContentDirective,
		CUBPopupFooterComponent,
		CUBPopupFooterDirective,
		CUBPopupHeaderComponent,
		CUBPopupHeaderDirective,
		CUBPopupTriggerForDirective,
	],
	declarations: [
		CUBPopupComponent,
		CUBPopupContentComponent,
		CUBPopupContentDirective,
		CUBPopupFooterComponent,
		CUBPopupFooterDirective,
		CUBPopupHeaderComponent,
		CUBPopupHeaderDirective,
		CUBPopupTriggerForDirective,
	],
	providers: [
		CUBPopupService,
	],
})
export class CUBPopupModule {}
