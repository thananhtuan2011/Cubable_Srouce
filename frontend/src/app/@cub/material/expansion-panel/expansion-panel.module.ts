import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';

import {
	CUBAccordionComponent
} from './accordion/accordion.component';
import {
	CUBExpansionPanelComponent
} from './expansion-panel/expansion-panel.component';
import {
	CUBExpansionPanelContentComponent
} from './expansion-panel/expansion-panel-content.component';
import {
	CUBExpansionPanelContentDirective
} from './expansion-panel/expansion-panel-content.directive';
import {
	CUBExpansionPanelHeaderComponent
} from './expansion-panel/expansion-panel-header.component';

@NgModule({
	imports: [
		CoreModule,

		CUBIconModule,
	],
	exports: [
		CUBAccordionComponent,
		CUBExpansionPanelComponent,
		CUBExpansionPanelContentComponent,
		CUBExpansionPanelContentDirective,
		CUBExpansionPanelHeaderComponent,
	],
	declarations: [
		CUBAccordionComponent,
		CUBExpansionPanelComponent,
		CUBExpansionPanelContentComponent,
		CUBExpansionPanelContentDirective,
		CUBExpansionPanelHeaderComponent,
	],
	providers: [],
})
export class CUBExpansionPanelModule {}
