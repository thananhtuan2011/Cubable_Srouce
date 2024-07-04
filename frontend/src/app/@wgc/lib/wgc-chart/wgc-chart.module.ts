import { NgModule } from '@angular/core';
import {
	ArcElement, LineElement, BarElement,
	PointElement, BarController, BubbleController,
	DoughnutController, LineController, PieController,
	PolarAreaController, RadarController, ScatterController,
	CategoryScale, LinearScale, LogarithmicScale,
	RadialLinearScale, TimeScale, TimeSeriesScale,
	Filler, Legend, Title,
	Tooltip, Chart, FontSpec,
	GridLineOptions
} from 'chart.js';

import { CoreModule } from '@core';

import { COLOR } from '@resources';

import { WGCTruncateModule } from '../wgc-truncate';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCTagModule } from '../wgc-tag';
import { WGCButtonModule } from '../wgc-button';

import { WGCChartLegendComponent } from './common/chart-legend/wgc-chart-legend.component';
import { WGCBarChartComponent } from './bar-chart/wgc-bar-chart.component';
import { WGCLineChartComponent } from './line-chart/wgc-line-chart.component';
import { WGCPieChartComponent } from './pie-chart/wgc-pie-chart.component';
import { WGCDonutChartComponent } from './donut-chart/wgc-donut-chart.component';

@NgModule({
	imports: [
		CoreModule,

		WGCTruncateModule, WGCTooltipModule, WGCTagModule, WGCButtonModule,
	],
	exports: [
		WGCChartLegendComponent, WGCBarChartComponent, WGCLineChartComponent,
		WGCPieChartComponent, WGCDonutChartComponent,
	],
	declarations: [
		WGCChartLegendComponent, WGCBarChartComponent, WGCLineChartComponent,
		WGCPieChartComponent, WGCDonutChartComponent,
	],
	providers: [],
})
export class WGCChartModule {

	/**
	 * @constructor
	 */
	constructor() {
		Chart.register(
			ArcElement, LineElement, BarElement,
			PointElement, BarController, BubbleController,
			DoughnutController, LineController, PieController,
			PolarAreaController, RadarController, ScatterController,
			CategoryScale, LinearScale, LogarithmicScale,
			RadialLinearScale, TimeScale, TimeSeriesScale,
			Filler, Legend, Title, Tooltip
		);

		Chart.defaults.font.size = 13;
		Chart.defaults.font.weight = '400';
		Chart.defaults.font.family = 'AvertaStdCY, Helvetica, sans-serif';
		Chart.defaults.color = COLOR.TEXT;
		Chart.defaults.maintainAspectRatio = false;
		Chart.defaults.scales.category.grid
			= Chart.defaults.scales.linear.grid
			= { drawBorder: false, color: COLOR.BORDER } as GridLineOptions;
		Chart.defaults.scales.category.title
			= Chart.defaults.scales.linear.title
			= { font: { size: 12, weight: '600' } as FontSpec } as any;
		Chart.defaults.plugins.legend.display = false;
	}

}
