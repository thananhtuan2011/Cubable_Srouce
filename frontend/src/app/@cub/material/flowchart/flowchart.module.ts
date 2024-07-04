import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from '@core';

import {
	CUBButtonModule
} from '../button';

import {
	CUBFlowchartNodeTemplateDirective
} from './flowchart-node-template.directive';
import {
	CUBFlowchartNodeComponent
} from './flowchart-node.component';
import {
	CUBFlowchartComponent
} from './flowchart.component';

@NgModule({
	imports: [
		CoreModule,

		CUBButtonModule,
	],
	exports: [
		CUBFlowchartComponent,
		CUBFlowchartNodeTemplateDirective,
	],
	declarations: [
		CUBFlowchartComponent,
		CUBFlowchartNodeComponent,
		CUBFlowchartNodeTemplateDirective,
	],
	providers: [],
})
export class CUBFlowchartModule {}
