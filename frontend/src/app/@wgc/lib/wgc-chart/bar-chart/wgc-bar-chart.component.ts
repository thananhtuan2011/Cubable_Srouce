import {
	Component, ViewEncapsulation, Input,
	ViewChild, ElementRef, AfterViewInit,
	OnChanges, SimpleChanges, ChangeDetectorRef,
	HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import {
	Chart, ChartOptions, ChartData,
	ChartDataset, LinearScaleOptions, TooltipItem
} from 'chart.js';
import _ from 'lodash';

import { COLOR } from '@resources';
import { DefaultValue, CoerceNumber, CoerceBoolean, CoerceCssPixel } from '@core';

export type WGCIBarChartSortType = 'random' | 'asc' | 'desc';

export interface WGCIBarChartDataset {
	data: number[];
	label?: string;
	color?: string | string[];
	grouped?: boolean;
	skipNull?: boolean;
}

@Component({
	selector		: 'wgc-bar-chart',
	templateUrl		: './wgc-bar-chart.pug',
	styleUrls		: [ './wgc-bar-chart.scss' ],
	host			: { class: 'wgc-bar-chart' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCBarChartComponent implements OnChanges, AfterViewInit {

	@HostBinding( 'style.--bar-chart-width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.--bar-chart-height' )
	get styleHeight(): string { return this.height; }

	@HostBinding( 'class.wgc-bar-chart--empty' )
	get classEmpty(): boolean { return this.isEmpty; }

	@ViewChild( 'canvas' ) public canvas: ElementRef;

	@Input() public labels: string[];
	@Input() public datasets: WGCIBarChartDataset[];
	@Input() public options: ChartOptions;
	@Input() public xAxisTitle: string;
	@Input() public yAxisTitle: string;
	@Input() public prefixUnit: string;
	@Input() public suffixUnit: string;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @DefaultValue() public defaultColor: string = COLOR.BORDER;
	@Input() @DefaultValue() public sortBy: WGCIBarChartSortType = 'random';
	@Input() @CoerceNumber() public barWidth: number;
	@Input() @CoerceBoolean() public stacked: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public displayXAxisTitle: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public displayYAxisTitle: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public displayLegend: boolean = true;

	public chart: Chart;
	public isEmpty: boolean;

	private _defaultOptions: ChartOptions = {
		plugins: {
			tooltip: {
				callbacks: {
					title( tooltipItem: TooltipItem<any> ) {
						const label: string = tooltipItem?.[ 0 ]?.label || '';

						return _.truncate( label, { length: 50 } );
					},
					label( tooltipItem: TooltipItem<any> ) {
						const label: string = tooltipItem?.dataset?.label || '';
						const data: number = tooltipItem?.dataset?.data?.[ tooltipItem?.dataIndex ] as number || 0;

						return ` ${_.truncate( label, { length: 50 } )}: ${_.toCommasSeparator( data )}`;
					},
				} as any,
			},
		},
		animation: {
			onProgress: () => {
				this.isEmpty = false;

				this._cdRef.markForCheck();
			},
			onComplete: ( animation: any ) => setTimeout( () => {
				this.isEmpty = !animation.chart.config.data.datasets.length;

				this._cdRef.markForCheck();
			} ),
		},
		scales: {
			x: {
				title	: {},
				grid	: { display: false },
				ticks: {
					callback( index: number ) {
						const label: string = String( this.chart?.data.labels[ index ] || '' );

						return _.truncate( label, { length: 50 } );
					},
				},
			},
			y: {
				title: {},
				ticks: {
					callback: ( value: any ) => `${this.prefixUnit || ''}${value}${this.suffixUnit || ''}`,
				},
			},
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

		if ( changes.labels || changes.datasets ) {
			this.chart.data = this._serializeData();

			this.chart.update();
		}

		if ( changes.stacked
			|| changes.prefixUnit
			|| changes.suffixUnit
			|| changes.xAxisTitle
			|| changes.yAxisTitle
			|| changes.displayXAxisTitle
			|| changes.displayYAxisTitle
			|| changes.displayLegend ) {
			this.chart.options = this._serializeOptions();

			this.chart.update();
		}

		if ( changes.datasets ) this._setSuggestedMax();

		if ( changes.labels || changes.datasets || changes.sortBy ) this._sorting( this.sortBy );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.chart = new Chart(
			this.canvas.nativeElement,
			{
				type	: 'bar',
				data	: this._serializeData(),
				options	: this._serializeOptions(),
			}
		);

		this._setSuggestedMax();
		this._sorting( this.sortBy );
		this._cdRef.detectChanges();
	}

	/**
	 * @param {WGCIBarChartSortType} type
	 * @return {void}
	 */
	private _sorting( type: WGCIBarChartSortType = 'random' ) {
		if ( type === 'random' ) {
			this.chart.data = this._serializeData();
		} else {
			const unzipBg: string[][] = _.unzip( _.map( this.datasets, 'color' ) );
			const unzipData: number[][] = _.unzip( _.map( this.datasets, 'data' ) );
			const allData: ObjectType[] = _.map( this.labels, ( label: string, index: number ) => ({
				label,
				color	: unzipBg[ index ],
				data	: unzipData[ index ],
				weight	: _.max( unzipData[ index ] ),
			}) );
			const sortedData: ObjectType[] = _.sortBy( allData, 'weight' );

			type === 'desc' && sortedData.reverse();

			// @ts-ignore
			const zipBg: string[][] = _.zip( ..._.map( sortedData, 'color' ) );
			const zipData: number[][] = _.zip( ..._.map( sortedData, 'data' ) );

			// Update label positions
			this.chart.data.labels = _.map( sortedData, 'label' );

			// Update dataset positions
			this.chart.data.datasets = _.map( this.chart.data.datasets, ( dataset: ChartDataset, index: number ) => {
				dataset.backgroundColor = zipBg[ index ];
				dataset.data = zipData[ index ];

				return dataset;
			} );
		}

		this.chart.update();
	}

	/**
	 * @return {void}
	 */
	private _setSuggestedMax() {
		const max: number = this._getSuggestedMax();

		if ( max === -Infinity ) return;

		( this.chart.options.scales.y as LinearScaleOptions ).suggestedMax = max;

		this.chart.update();
	}

	/**
	 * @return {number}
	 */
	private _getSuggestedMax(): number {
		const allData: number[] = _.flatten( _.map( this.datasets, 'data' ) );
		const max: number = _.max( allData );

		return max !== -Infinity ? max + Math.ceil( max / 2 ) : max;
	}

	/**
	 * @return {ChartData}
	 */
	private _serializeData(): ChartData {
		const barThickness: number = this.barWidth || ( this.stacked ? 55 : 20 );
		const datasets: ChartDataset[] = _.map( this.datasets, ( dataset: WGCIBarChartDataset ) => ({
			barThickness,
			label			: dataset.label,
			data			: dataset.data,
			backgroundColor	: dataset.color || this.defaultColor,
			grouped			: dataset.grouped,
			skipNull		: dataset.skipNull,
		}) );

		return { labels: this.labels, datasets };
	}

	/**
	 * @return {ChartOptions}
	 */
	private _serializeOptions(): ChartOptions {
		( this._defaultOptions.scales.x as LinearScaleOptions ).stacked
			= ( this._defaultOptions.scales.y as LinearScaleOptions ).stacked
			= this.stacked;
		( this._defaultOptions.scales.x as LinearScaleOptions ).title.display = this.displayXAxisTitle;
		( this._defaultOptions.scales.x as LinearScaleOptions ).title.text = _.toUpper( this.xAxisTitle );
		( this._defaultOptions.scales.y as LinearScaleOptions ).title.display = this.displayYAxisTitle;
		( this._defaultOptions.scales.y as LinearScaleOptions ).title.text = _.toUpper( this.yAxisTitle );
		( this._defaultOptions.scales.y as LinearScaleOptions ).suggestedMax = this._getSuggestedMax();

		return { ...this._defaultOptions, ...this.options };
	}

}
