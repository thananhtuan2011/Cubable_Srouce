import {
	ElementRef, HostListener, Input,
	Directive, EventEmitter, Output,
	ViewContainerRef, AfterViewInit, OnDestroy,
	OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import {
	Overlay, OverlayRef, HorizontalConnectionPos,
	VerticalConnectionPos, OverlayConfig, FlexibleConnectedPositionStrategy,
	ConnectedOverlayPositionChange, PositionStrategy
} from '@angular/cdk/overlay';
import { Direction } from '@angular/cdk/bidi';
import { TemplatePortal, ComponentPortal } from '@angular/cdk/portal';
import { FocusMonitor } from '@angular/cdk/a11y';
import { takeWhile } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, CoerceCssPixel, Memoize,
	untilCmpDestroyed
} from '@core';
import { WGCTooltipComponent, WGCITooltipPosition, WGCITooltipDirection } from './wgc-tooltip.component';

@Unsubscriber()
@Directive({ selector: '[wgcTooltip]', exportAs: 'wgcTooltip' })
export class WGCTooltipDirective implements OnChanges, AfterViewInit, OnDestroy {

	@Input() public panelClass: string | string[];
	@Input() @DefaultValue() public backdropClass: string | string[] = [ 'cdk-overlay-transparent-backdrop' ];
	@Input() public tooltipColor: string;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public programmatically: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public autoClose: boolean = true;
	@Input() @CoerceNumber() public offsetX: number;
	@Input() @CoerceNumber() public offsetY: number;
	@Input() public originX: HorizontalConnectionPos;
	@Input() public originY: VerticalConnectionPos;
	@Input() public overlayX: HorizontalConnectionPos;
	@Input() public overlayY: VerticalConnectionPos;
	@Input() @DefaultValue() public layoutDir: Direction = 'ltr';
	@Input() @DefaultValue() public position: WGCITooltipPosition = 'above';

	@Output() public opened: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
	@Output() public closed: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	public isOpened: boolean;

	private _portal: any;
	private _tooltip: any;
	private _isOverlayElementHover: boolean;
	private _instance: WGCTooltipComponent;
	private _overlayRef: OverlayRef;
	private _resizeObserver: ResizeObserver;
	private _openDebounce: ReturnType<typeof _.debounce>
		= _.debounce( ( event: MouseEvent ) => this.open( event ), 300 );
	private _closeDebounce: ReturnType<typeof _.debounce>
		= _.debounce( ( event: MouseEvent ) => !this._isOverlayElementHover && this.close( event ), 100 );

	@Input( 'wgcTooltip' )
	get tooltip(): any { return this._tooltip; }
	set tooltip( tooltip: any ) {
		if ( tooltip === this._tooltip ) return;

		this._tooltip = tooltip;
	}

	get canAttach(): boolean {
		return !!this._elementRef.nativeElement.clientWidth
				|| !!this._elementRef.nativeElement.clientHeight
				|| !!this._elementRef.nativeElement.getBoundingClientRect().width
				|| !!this._elementRef.nativeElement.getBoundingClientRect().height;
	}

	get canAutoOpen(): boolean {
		return !this.disabled && !this.programmatically && !this.isOpened;
	}

	get canAutoClose(): boolean {
		return this.autoClose && !this.programmatically && this.isOpened;
	}

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {ViewContainerRef} _vcRef
	 * @param {FocusMonitor} _focusMonitor
	 */
	constructor(
		private _overlay: Overlay,
		private _elementRef: ElementRef,
		private _cdRef: ChangeDetectorRef,
		private _vcRef: ViewContainerRef,
		private _focusMonitor: FocusMonitor
	) {}

	@HostListener( 'click' )
	public triggerClick() {
		if ( !this.tooltip ) return;

		this._openDebounce.cancel();
	}

	@HostListener( 'mousemove', [ '$event' ] )
	public triggerMouseEnter( event: MouseEvent ) {
		if ( !this.tooltip ) return;

		this.canAutoOpen && this._openDebounce( event );
	}

	@HostListener( 'mouseleave', [ '$event' ] )
	public triggerMouseLeave( event: MouseEvent ) {
		if ( !this.tooltip ) return;

		this._openDebounce.cancel();

		this.canAutoClose && this._closeDebounce( event );
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.tooltip && this._setTooltipMessage();
		changes.disabled && this.disabled && this.close();
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._focusMonitor.monitor( this._elementRef )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( this.close.bind( this ) );

		this._resizeObserver?.disconnect();
		this._resizeObserver = new ResizeObserver( () => !this.canAttach && this.close() );

		this._resizeObserver.observe( this._elementRef.nativeElement );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._openDebounce?.cancel();
		this._closeDebounce?.cancel();
		this._overlayRef?.dispose();
		this._resizeObserver?.disconnect();
	}

	/**
	 * @param {MouseEvent=} event
	 * @return {void}
	 */
	public open( event?: MouseEvent ) {
		if ( this.isOpened || !this.canAttach ) return;

		// Create overlay
		const overlayRef: OverlayRef = this._createOverlay();

		// Attach content & create instance
		if ( this.tooltip instanceof WGCTooltipComponent ) {
			this._instance = this.tooltip;

			overlayRef.attach( this._createPortal() );
		} else {
			this._instance = overlayRef.attach( this._createPortal() ).instance;

			this._setTooltipMessage();
		}

		// Bind instance's attributes
		const minWidth: string = this.minWidth ?? this._instance.minWidth;
		const minHeight: string = this.minHeight ?? this._instance.minHeight;
		this._instance.color ??= this.tooltipColor;
		this._instance.width ??= this.width;
		this._instance.minWidth ??= parseFloat( minWidth ) < window.innerWidth ? minWidth : undefined;
		this._instance.maxWidth ??= this.maxWidth;
		this._instance.height ??= this.height;
		this._instance.minHeight ??= parseFloat( minHeight ) < window.innerHeight ? minHeight : undefined;
		this._instance.maxHeight ??= this.maxHeight;

		// Bind instance's methods
		this._instance.close = this.close.bind( this );

		// Detach instance out of dom tree changes detection
		this._instance.detectChanges();
		this._instance.detach();

		// Emit on opened event
		this.opened.emit( event );

		this._cdRef.markForCheck();
	}

	/**
	 * @param {MouseEvent=} event
	 * @return {void}
	 */
	public close( event?: MouseEvent ) {
		if ( !this.isOpened ) return;

		this._overlayRef.dispose();
		this.closed.emit( event );

		this._cdRef.markForCheck();
	}

	/**
	 * @param {PositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public updatePosition( positionStrategy: PositionStrategy = this._createPositionStrategy() ) {
		this._overlayRef?.updatePositionStrategy( positionStrategy );
	}

	/**
	 * @return {void}
	 */
	private _setTooltipMessage() {
		if ( !this._instance ) return;

		this._instance.messageOnly = false;

		if ( _.isString( this.tooltip ) ) {
			this._instance.message = this.tooltip.toString();
			this._instance.messageOnly = true;
		}

		this._instance.detectChanges();
	}

	/**
	 * @return {TemplatePortal | ComponentPortal<WGCTooltipComponent>}
	 */
	private _createPortal(): TemplatePortal | ComponentPortal<WGCTooltipComponent> {
		if ( this.tooltip instanceof WGCTooltipComponent ) {
			if ( !this._portal || this._portal.templateRef !== this.tooltip?.templateRef ) {
				this._portal = new TemplatePortal( this.tooltip?.templateRef, this._vcRef );
			}
		} else {
			this._portal ||= new ComponentPortal( WGCTooltipComponent, this._vcRef );
		}

		return this._portal;
	}

	/**
	 * @return {OverlayRef}
	 */
	private _createOverlay(): OverlayRef {
		const config: OverlayConfig = new OverlayConfig({
			panelClass		: this.panelClass ?? this.tooltip?.panelClass,
			backdropClass	: this.backdropClass ?? this.tooltip?.backdropClass,
			scrollStrategy	: this._overlay.scrollStrategies.close(),
			positionStrategy: this._createPositionStrategy(),
		});
		const overlayRef: OverlayRef = this._overlay.create( config );
		const resizeObserver: ResizeObserver = new ResizeObserver( ( entries: ResizeObserverEntry[] ) => {
			const viewPortWidth: number = Math.max( document.documentElement.clientWidth, window.innerWidth || 0 );
			const viewPortHeight: number = Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

			for ( const entry of entries ) {
				// We get the width & height of the element from the the contentRect, provided by the resize observer
				const width: number = entry.contentRect.width;
				const height: number = entry.contentRect.height;
				const domReact: DOMRect = entry.target.getBoundingClientRect();
				const x: number = domReact.left;
				const y: number = domReact.top;
				const offsetPlusWidth: number = x + width;
				const offsetPlusHeight: number = y + height;
				const pixelsOverflowX: number = offsetPlusWidth - viewPortWidth;
				const pixelsOverflowY: number = offsetPlusHeight - viewPortHeight;
				// If x is negative, we are off-screen to the left.
				// If y is negative, we are off-screen to the top.
				// If pixelsOverflowX is positive, we are off-screen on the right
				// If pixelsOverflowY is positive, we are off-screen on the bottom
				// In either case, we adopt a new strategy.
				const isResized: boolean = x < 0 || y < 0 || pixelsOverflowX > 1 || pixelsOverflowY > 1;

				isResized && this.updatePosition();
			}
		} );

		// Set direction
		overlayRef.setDirection( this.layoutDir );

		// On backdrop click
		overlayRef
		.backdropClick()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: MouseEvent ) => this.canAutoClose && this.close( event ) );

		// On attach
		overlayRef
		.attachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.isOpened = true;

			// Element for which to observe height and width
			resizeObserver.observe( overlayRef.overlayElement );
		} );

		// On detach
		overlayRef
		.detachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.isOpened = false;

			resizeObserver.disconnect();
		} );

		// On position changes
		( overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy ).positionChanges
		.pipe(
			takeWhile( () => !!this.position ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( change: ConnectedOverlayPositionChange ) => {
			const _originX: HorizontalConnectionPos = change.connectionPair.originX;
			const _originY: VerticalConnectionPos = change.connectionPair.originY;
			const _overlayX: HorizontalConnectionPos = change.connectionPair.overlayX;
			const _overlayY: VerticalConnectionPos = change.connectionPair.overlayY;
			let position: WGCITooltipPosition;
			let direction: WGCITooltipDirection;

			if ( _originX === 'center' ) {
				position = _originY === 'top' ? 'above' : 'below';

				if ( _overlayX !== 'center' ) direction = _overlayX === 'start' ? 'start' : 'end';
			}

			if ( _originY === 'center' ) {
				position = _originX === 'start' ? 'before' : 'after';

				if ( _overlayY !== 'center' ) direction = _overlayY === 'top' ? 'start' : 'end';
			}

			this._instance.setPositionClasses( position, direction );
			this._instance.detectChanges();
		} );

		// Add overlay element events
		overlayRef.overlayElement.removeEventListener( 'mousemove', undefined );
		overlayRef.overlayElement.removeEventListener( 'mouseleave', undefined );
		overlayRef.overlayElement.addEventListener( 'mousemove', () => this._isOverlayElementHover = true );
		overlayRef.overlayElement.addEventListener( 'mouseleave', ( overlayMouseEvent: MouseEvent ) => {
			this._isOverlayElementHover = false;

			this.canAutoClose && this.close( overlayMouseEvent );
		} );

		return this._overlayRef = overlayRef;
	}

	/**
	 * @return {FlexibleConnectedPositionStrategy}
	 */
	private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
		let originX: HorizontalConnectionPos = this.originX || 'center';
		let originY: VerticalConnectionPos = this.originY || 'center';
		let originFallbackX: HorizontalConnectionPos = originX;
		let originFallbackY: VerticalConnectionPos = originY;
		let overlayX: HorizontalConnectionPos = this.overlayX || 'center';
		let overlayY: VerticalConnectionPos = this.overlayY || 'center';
		let overlayFallbackX: HorizontalConnectionPos = overlayX;
		let overlayFallbackY: VerticalConnectionPos = overlayY;
		let offsetX: number = +( this.offsetX || 0 );
		let offsetY: number = +( this.offsetY || 0 );
		let offsetFallbackX: number = offsetX;
		let offsetFallbackY: number = offsetY;

		switch ( this.position ) {
			case 'above':
			case 'below':
				if ( !this.originY ) originY = this.position === 'above' ? 'top' : 'bottom';
				if ( !this.overlayY ) overlayY = this.position === 'above' ? 'bottom' : 'top';
				if ( _.isNil( this.offsetY ) ) offsetY = this.position === 'above' ? -4 : 4;

				offsetFallbackX = -offsetX;
				offsetFallbackY = -offsetY;
				break;
			case 'before':
			case 'after':
				if ( !this.originX ) originX = this.position === 'before' ? 'start' : 'end';
				if ( !this.overlayX ) overlayX = this.position === 'before' ? 'end' : 'start';
				if ( _.isNil( this.offsetX ) ) offsetX = this.position === 'before' ? -4 : 4;

				offsetFallbackX = -offsetX;
				offsetFallbackY = -offsetY;
				break;
		}

		originFallbackX = this._fallbackX( originX );
		originFallbackY = this._fallbackY( originY );
		overlayFallbackX = this._fallbackX( overlayX );
		overlayFallbackY = this._fallbackY( overlayY );

		return this._overlay
		.position()
		.flexibleConnectedTo( this._elementRef )
		.withLockedPosition()
		.withPush( true )
		.withPositions([
			{
				originX, originY,
				overlayX, overlayY,
				offsetX, offsetY,
			},
			{
				originX: originFallbackX, originY,
				overlayX: overlayFallbackX, overlayY,
				offsetX: offsetFallbackX, offsetY,
			},
			{
				originX, originY: originFallbackY,
				overlayX, overlayY: overlayFallbackY,
				offsetX, offsetY: offsetFallbackY,
			},
			{
				originX: originFallbackX, originY: originFallbackY,
				overlayX: overlayFallbackX, overlayY: overlayFallbackY,
				offsetX: offsetFallbackX, offsetY: offsetFallbackY,
			},
			{
				originX: originFallbackX, originY,
				overlayX: 'start', overlayY,
				offsetX: -4, offsetY,
			},
			{
				originX: originFallbackX, originY,
				overlayX: 'end', overlayY,
				offsetX: 4, offsetY,
			},
			{
				originX, originY: originFallbackY,
				overlayX, overlayY: 'top',
				offsetX, offsetY: -4,
			},
			{
				originX, originY: originFallbackY,
				overlayX, overlayY: 'bottom',
				offsetX, offsetY: 4,
			},
		]);
	}

	/**
	 * @param {HorizontalConnectionPos} origin
	 * @return {HorizontalConnectionPos}
	 */
	@Memoize()
	private _fallbackX( origin: HorizontalConnectionPos ): HorizontalConnectionPos {
		switch ( origin ) {
			case 'start':
				return 'end';
			case 'end':
				return 'start';
			default:
				return origin;
		}
	}

	/**
	 * @param {VerticalConnectionPos} origin
	 * @return {VerticalConnectionPos}
	 */
	@Memoize()
	private _fallbackY( origin: VerticalConnectionPos ): VerticalConnectionPos {
		switch ( origin ) {
			case 'top':
				return 'bottom';
			case 'bottom':
				return 'top';
			default:
				return origin;
		}
	}

}
