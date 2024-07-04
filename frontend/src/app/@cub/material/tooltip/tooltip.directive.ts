import {
	Directive,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import {
	CUBOverlayDispatcher,
	CUBOverlayPosition
} from '../overlay';

import {
	CUBTooltipType
} from './tooltip.component';
import {
	CUBTooltipConfig,
	CUBTooltipRef,
	CUBTooltipService
} from './tooltip.service';

@Directive({
	selector: '[cubTooltip]',
	exportAs: 'cubTooltip',
})
export class CUBTooltipDirective
	extends CUBOverlayDispatcher
	implements OnInit, OnDestroy {

	@Input( 'cubTooltip' )
	public tooltip: string | TemplateRef<any>;
	@Input( 'cubTooltipType' )
	public type: CUBTooltipType;
	@Input( 'cubTooltipPosition' )
	public position: CUBOverlayPosition;
	@Input( 'cubTooltipWidth' )
	public width: string | number;
	@Input( 'cubTooltipMinWidth' )
	public minWidth: string | number;
	@Input( 'cubTooltipMaxWidth' )
	public maxWidth: string | number;
	@Input( 'cubTooltipHeight' )
	public height: string | number;
	@Input( 'cubTooltipMinHeight' )
	public minHeight: string | number;
	@Input( 'cubTooltipMaxHeight' )
	public maxHeight: string | number;
	@Input( 'cubTooltipDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubTooltipDisableClose' ) @CoerceBoolean()
	public disableClose: boolean;
	@Input( 'cubTooltipOpenDelayMs' ) @DefaultValue() @CoerceNumber()
	public openDelayMs: number = 300;
	@Input( 'cubTooltipCloseDelayMs' ) @DefaultValue() @CoerceNumber()
	public closeDelayMs: number = 100;
	@Input( 'cubTooltipContext' )
	public context: ObjectType;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();

	private _tooltipService: CUBTooltipService;
	private _tooltipRef: CUBTooltipRef;
	private _openDebounce: ReturnType<typeof _.debounce>;
	private _closeDebounce: ReturnType<typeof _.debounce>;

	get isOpened(): boolean {
		return !!this._tooltipRef?.isOpened;
	}

	/**
	 * @constructor
	 */
	constructor() {
		const tooltipService: CUBTooltipService
			= inject( CUBTooltipService );

		super( tooltipService );

		this._tooltipService = tooltipService;
	}

	@HostListener( 'mousemove' )
	protected onMousemove() {
		if ( !this.tooltip
			|| this.disableOpen ) {
			return;
		}

		this._openDebounce();
	}

	@HostListener( 'mouseleave' )
	protected onMouseleave() {
		if ( !this.tooltip
			|| this.disableClose ) {
			return;
		}

		this._openDebounce.cancel();

		this._closeDebounce();
	}

	ngOnInit() {
		this._openDebounce = _.debounce( () => {
			this.open();
		}, this.openDelayMs );
		this._closeDebounce = _.debounce( () => {
			if ( this._tooltipRef?.isOverlayHover ) {
				return;
			}

			this.close();
		}, this.closeDelayMs );
	}

	ngOnDestroy() {
		super.ngOnDestroy();

		this._openDebounce?.cancel();
		this._closeDebounce?.cancel();
	}

	/**
	 * @param {ObjectType=} context
	 * @param {CUBTooltipConfig=} config
	 * @return {void}
	 */
	public open(
		context: ObjectType = this.context,
		config?: CUBTooltipConfig
	) {
		if ( this.isOpened ) {
			return;
		}

		this._tooltipRef
			= this._tooltipService.open(
				this.originElement,
				this.tooltip,
				context,
				this.getConfig( config ),
				this.getCallbacks()
			);
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) {
			return;
		}

		this._tooltipRef?.close();
	}

	/**
	 * @return {void}
	 */
	protected override onAttached() {
		this.opened.emit();
	}

	/**
	 * @return {void}
	 */
	protected override onDetached() {
		this.closed.emit();
	}

	/**
	 * @param {CUBTooltipConfig=} config
	 * @return {CUBTooltipConfig}
	 */
	protected override getConfig(
		config?: CUBTooltipConfig
	): CUBTooltipConfig {
		config = {
			...super.getConfig(),
			..._.omitBy(
				{
					type: this.type,
					width: this.width,
					minWidth: this.minWidth,
					maxWidth: this.maxWidth,
					height: this.height,
					minHeight: this.minHeight,
					maxHeight: this.maxHeight,
				},
				_.isUndefined
			),
			...config,
		};

		return config;
	}

}
