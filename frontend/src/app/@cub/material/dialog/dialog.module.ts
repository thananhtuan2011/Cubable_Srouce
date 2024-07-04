import {
	NgModule
} from '@angular/core';
import {
	OverlayModule
} from '@angular/cdk/overlay';
import {
	PortalModule
} from '@angular/cdk/portal';
import {
	ResizableModule
} from 'angular-resizable-element';

import {
	CoreModule
} from 'angular-core';

import {
	CUBDialogContainerComponent
} from './dialog-container/dialog-container.component';
import {
	CUBDialogContentDirective
} from './dialog/dialog-content.directive';
import {
	CUBDialogFooterDirective
} from './dialog/dialog-footer.directive';
import {
	CUBDialogHeaderDirective
} from './dialog/dialog-header.directive';
import {
	CUBDialogService
} from './dialog/dialog.service';

@NgModule({
	imports: [
		OverlayModule,
		PortalModule,
		ResizableModule,

		CoreModule,
	],
	exports: [
		CUBDialogContentDirective,
		CUBDialogFooterDirective,
		CUBDialogHeaderDirective,
	],
	declarations: [
		CUBDialogContainerComponent,
		CUBDialogContentDirective,
		CUBDialogFooterDirective,
		CUBDialogHeaderDirective,
	],
	providers: [
		CUBDialogService,
	],
})
export class CUBDialogModule {}
