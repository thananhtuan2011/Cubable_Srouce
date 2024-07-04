import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCScrollBarModule } from '../wgc-scroll-bar';

import { WGCAccordionComponent } from './accordion/wgc-accordion.component';
import { WGCExpansionPanelComponent } from './expansion-panel/wgc-expansion-panel.component';
import { WGCExpansionPanelHeaderComponent } from './expansion-panel-header/wgc-expansion-panel-header.component';
import { WGCExpansionPanelContentComponent } from './expansion-panel-content/wgc-expansion-panel-content.component';
import { WGCExpansionPanelContentDirective } from './expansion-panel-content/wgc-expansion-panel-content.directive';

@NgModule({
	imports: [
		DragDropModule,

		CoreModule,

		WGCIconModule, WGCScrollBarModule,
	],
	exports: [
		WGCAccordionComponent, WGCExpansionPanelComponent, WGCExpansionPanelHeaderComponent,
		WGCExpansionPanelContentComponent, WGCExpansionPanelContentDirective,
	],
	declarations: [
		WGCAccordionComponent, WGCExpansionPanelComponent, WGCExpansionPanelHeaderComponent,
		WGCExpansionPanelContentComponent, WGCExpansionPanelContentDirective,
	],
	providers: [],
})
export class WGCExpansionPanelModule {}
