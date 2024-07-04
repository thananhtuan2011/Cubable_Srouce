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
import { DefaultValue, CoerceBoolean, CoerceCssPixel } from '@core';

export type WGCILineChartSortType = 'random' | 'asc' | 'desc';

export interface WGCILineChartDataset {
	data: number[];
	label?: string;
	color?: string | string[];
	grouped?: boolean;
	skipNull?: boolean;
}

@Component({
	selector		: 'wgc-line-chart',
	templateUrl		: './wgc-line-chart.pug',
	styleUrls		: [ './wgc-line-chart.scss' ],
	host			: { class: 'wgc-line-chart' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCLineChartComponent implements OnChanges, AfterViewInit {

	@HostBinding( 'style.--line-chart-width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.--line-chart-height' )
	get styleHeight(): string { return this.height; }

	@HostBinding( 'class.wgc-line-chart--empty' )
	get classEmpty(): boolean { return this.isEmpty; }

	@ViewChild( 'canvas' ) public canvas: ElementRef;

	@Input() public labels: string[];
	@Input() public datasets: WGCILineChartDataset[];
	@Input() public options: ObjectType;
	@Input() public xAxisTitle: string;
	@Input() public yAxisTitle: string;
	@Input() public prefixUnit: string;
	@Input() public suffixUnit: string;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @DefaultValue() public defaultColor: string = COLOR.BORDER;
	@Input() @DefaultValue() public sortBy: WGCILineChartSortType = 'random';
	@Input() @DefaultValue() @CoerceBoolean() public displayXAxisTitle: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public displayYAxisTitle: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public displayLegend: boolean = true;

	public chart: Chart;
	public isEmpty: boolean;

	private _defaultOptions: ChartOptions = {
		elements: {
			point: { radius: 4, hoverRadius: 8 },
		},
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
				title: {},
				ticks: {
					callback( index: number ) {
						const label: string = String( this.chart?.data.labels[ index ] || '' );

						return _.truncate( label, { length: 50 } );
					},
				},
			},
			y: {
				beginAtZero	: true,
				title		: {},
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

		if ( changes.prefixUnit
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
				type	: 'line',
				data	: this._serializeData(),
				options	: this._serializeOptions(),
			}
		);

		this._setSuggestedMax();
		this._sorting( this.sortBy );
		this._cdRef.detectChanges();
	}

	/**
	 * @param {WGCILineChartSortType} type
	 * @return {void}
	 */
	private _sorting( type: WGCILineChartSortType = 'random' ) {
		if ( type === 'random' ) {
			this.chart.data = this._serializeData();
		} else {
			const unzipData: number[][] = _.unzip( _.map( this.datasets, 'data' ) );
			const allData: ObjectType[] = _.map( this.labels, ( label: string, index: number ) => ({
				label, data: unzipData[ index ], weight: _.max( unzipData[ index ] ),
			}) );
			const sortedData: ObjectType[] = _.sortBy( allData, 'weight' );

			type === 'desc' && sortedData.reverse();

			const zipData: number[][] = _.zip( ..._.map( sortedData, 'data' ) );

			// Update label positions
			this.chart.data.labels = this._generate<string>( _.map( sortedData, 'label' ) );

			// Update dataset positions
			this.chart.data.datasets = _.map( this.chart.data.datasets, ( dataset: ChartDataset, index: number ) => {
				dataset.data = this._generate<number>( zipData[ index ] );

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

		( this.chart.options.scales.y as LinearScaleOptions ).suggestedMax = max + Math.ceil( max / 2 );

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
		const datasets: WGCILineChartDataset[] = _.map( this.datasets, ( dataset: WGCILineChartDataset ) => ({
			label			: dataset.label,
			data			: this._generate<number>( dataset.data ),
			backgroundColor	: dataset.color || this.defaultColor,
			borderColor		: dataset.color || this.defaultColor,
			borderWidth		: 4,
			grouped			: dataset.grouped,
			skipNull		: dataset.skipNull,
		}) );

		return { labels: this._generate<string>( this.labels ), datasets };
	}

	/**
	 * @return {ChartOptions}
	 */
	private _serializeOptions(): ChartOptions {
		( this._defaultOptions.scales.x as LinearScaleOptions ).title.display = this.displayXAxisTitle;
		( this._defaultOptions.scales.x as LinearScaleOptions ).title.text = _.toUpper( this.xAxisTitle );
		( this._defaultOptions.scales.y as LinearScaleOptions ).title.display = this.displayYAxisTitle;
		( this._defaultOptions.scales.y as LinearScaleOptions ).title.text = _.toUpper( this.yAxisTitle );
		( this._defaultOptions.scales.y as LinearScaleOptions ).suggestedMax = this._getSuggestedMax();

		return { ...this._defaultOptions, ...this.options };
	}

	/**
	 * @param {T[]} data
	 * @return {T[]}
	 */
	private _generate<T>( data: T[] ): T[] {
		return [ null, ...( data || [] ), null ];
	}

}
