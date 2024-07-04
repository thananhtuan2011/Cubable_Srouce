import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';
import { LegendItem, Chart, ChartMeta, ChartConfiguration } from 'chart.js';

import { DefaultValue, CoerceNumber } from '@core';

@Component({
	selector		: 'wgc-chart-legend',
	templateUrl		: './wgc-chart-legend.pug',
	styleUrls		: [ './wgc-chart-legend.scss' ],
	host			: { class: 'wgc-chart-legend' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCChartLegendComponent {

	@Input() public chart: Chart;
	@Input() @DefaultValue() @CoerceNumber() public limit: number = 5;

	get items(): LegendItem[] { return ( this.chart as any )?.legend?.legendItems; }

	/**
	 * @param {number} datasetIndex
	 * @return {void}
	 */
	public toggleDataVisibility( datasetIndex: number ) {
		switch ( ( this.chart.config as ChartConfiguration ).type ) {
			case 'bar':
			case 'line':
				const meta: ChartMeta = this.chart.getDatasetMeta( datasetIndex );
				if ( meta ) meta.hidden = !meta.hidden;
				break;
			case 'pie':
			case 'doughnut':
				this.chart.toggleDataVisibility( datasetIndex );
				break;
		}

		this.chart.update();
	}

}
