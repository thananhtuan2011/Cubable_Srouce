import {
	Component, ViewEncapsulation, Input,
	ViewChild, ElementRef, AfterViewInit,
	OnChanges, SimpleChanges, ChangeDetectorRef,
	HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import _ from 'lodash';
import { Chart, ChartOptions, ChartData, TooltipItem } from 'chart.js';

import { COLOR } from '@resources';
import { DefaultValue, CoerceBoolean } from '@core';

export interface WGCIPieChartDataset {
	data: number;
	label?: string;
	color?: string;
}

@Component({
	selector		: 'wgc-pie-chart',
	templateUrl		: './wgc-pie-chart.pug',
	styleUrls		: [ './wgc-pie-chart.scss' ],
	host			: { class: 'wgc-pie-chart' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCPieChartComponent implements OnChanges, AfterViewInit {

	@HostBinding( 'style.--pie-chart-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'class.wgc-pie-chart--empty' )
	get classEmpty(): boolean { return this.isEmpty; }

	@ViewChild( 'canvas' ) public canvas: ElementRef;

	@Input() public options: ObjectType;
	@Input() public datasets: WGCIPieChartDataset[];
	@Input() @DefaultValue() public defaultColor: string = COLOR.BORDER;
	@Input() @DefaultValue() public size: string = '630px';
	@Input() @DefaultValue() @CoerceBoolean() public displayLegend: boolean = true;

	public chart: Chart;
	public isEmpty: boolean;

	private _defaultOptions: ChartOptions = {
		plugins: {
			tooltip: {
				callbacks: {
					label( tooltipItem: TooltipItem<any> ) {
						const label: string = tooltipItem?.label || '';
						const data: number = tooltipItem?.dataset?.data?.[ tooltipItem?.dataIndex ] as number || 0;

						return ` ${_.truncate( label, { length: 50 } )}: ${_.toCommasSeparator( data )}`;
					},
				},
			},
		},
		animation: {
			onProgress: () => {
				this.isEmpty = false;

				this._cdRef.markForCheck();
			},
			onComplete: ( animation: any ) => setTimeout( () => {
				const firstSet: any = animation.chart.config.data.datasets[ 0 ].data;
				const dataSum: number = _.reduce( firstSet, ( accumulator: number, currentValue: number ) => accumulator + currentValue );

				this.isEmpty = _.isNil( dataSum ) || dataSum === 0;

				this._cdRef.markForCheck();
			} ),
		},
	};

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !this.chart ) return;

		if ( changes.datasets ) {
			this.chart.data = this._serializeData();

			this.chart.update();
		}

		if ( changes.displayLegend ) {
			this.chart.options = this._serializeOptions();

			this.chart.update();
		}
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.chart = new Chart(
			this.canvas.nativeElement,
			{
				type	: 'pie',
				data	: this._serializeData(),
				options	: this._serializeOptions(),
			}
		);

		this._cdRef.detectChanges();
	}

	/**
	 * @return {ChartData}
	 */
	private _serializeData(): ChartData {
		const labels: string[] = [];
		const data: number[] = [];
		const backgroundColor: string[] = [];

		_.forEach( this.datasets, ( dataset: WGCIPieChartDataset ) => {
			labels.push( dataset.label );
			data.push( dataset.data );
			backgroundColor.push( dataset.color || this.defaultColor );
		} );

		return { labels, datasets: [{ data, backgroundColor }] };
	}

	/**
	 * @return {ChartOptions}
	 */
	private _serializeOptions(): ChartOptions {
		return { ...this._defaultOptions, ...this.options };
	}

}
