import {
	ElementRef, HostListener, Input,
	Directive, EventEmitter, Output,
	ViewContainerRef, OnDestroy, ChangeDetectorRef,
	OnChanges, SimpleChanges
} from '@angular/core';
import {
	Overlay, OverlayRef, FlexibleConnectedPositionStrategy,
	HorizontalConnectionPos, VerticalConnectionPos, OverlayConfig,
	PositionStrategy
} from '@angular/cdk/overlay';
import { Direction } from '@angular/cdk/bidi';
import { ComponentPortal } from '@angular/cdk/portal';
import { skipWhile, debounceTime } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, CoerceCssPixel, Memoize,
	untilCmpDestroyed
} from '@core';

import { WGCFilePickerComponent, WGCIFilePickerPosition, WGCIFilePickerEvent } from './wgc-file-picker.component';

@Unsubscriber()
@Directive({ selector: '[wgcFilePicker]', exportAs: 'wgcFilePicker' })
export class WGCFilePickerDirective implements OnDestroy, OnChanges {

	@Input() public googleDriveMimeTypes: string[];
	@Input() public dropboxExtensions: string[];
	@Input() public oneDriveExtensions: string[];
	@Input() public fileAccept: string;
	@Input() public panelClass: string | string[];
	@Input() @DefaultValue() public backdropClass: string | string[] = [ 'cdk-overlay-transparent-backdrop' ];
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public imageOnly: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public useAuthorizedKey: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public multiSelect: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public hasBackdrop: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public closeOnClickOutside: boolean = true;
	@Input() @CoerceNumber() public offsetX: number;
	@Input() @CoerceNumber() public offsetY: number;
	@Input() public originX: HorizontalConnectionPos;
	@Input() public originY: VerticalConnectionPos;
	@Input() public overlayX: HorizontalConnectionPos;
	@Input() public overlayY: VerticalConnectionPos;
	@Input() @DefaultValue() public direction: Direction = 'ltr';
	@Input() @DefaultValue() public position: WGCIFilePickerPosition = 'below';

	@Output() public opened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public picked: EventEmitter<WGCIFilePickerEvent> = new EventEmitter<WGCIFilePickerEvent>();
	@Output() public backdropPress: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	public isOpened: boolean;

	private _instance: WGCFilePickerComponent;
	private _portal: ComponentPortal<WGCFilePickerComponent>;
	private _overlayRef: OverlayRef;

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {ViewContainerRef} _vcRef
	 */
	constructor(
		private _overlay: Overlay,
		private _elementRef: ElementRef,
		private _cdRef: ChangeDetectorRef,
		private _vcRef: ViewContainerRef
	) {}

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerClick( event: Event ) {
		if ( this.disabled || this.isOpened ) return;

		event.stopPropagation();
		event.preventDefault();
		this.open( event );
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !this._instance ) return;
		if ( changes.fileAccept ) this._instance.fileAccept = this.fileAccept;
		if ( changes.googleDriveMimeTypes ) this._instance.googleDriveMimeTypes = this.googleDriveMimeTypes;
		if ( changes.dropboxExtensions ) this._instance.dropboxExtensions = this.dropboxExtensions;
		if ( changes.oneDriveExtensions ) this._instance.oneDriveExtensions = this.oneDriveExtensions;
		if ( changes.multiSelect ) this._instance.multiSelect = this.multiSelect;
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._overlayRef?.dispose();
	}

	/**
	 * @param {WGCIFilePickerEvent} event
	 * @return {void}
	 */
	public onFilePicked( event: WGCIFilePickerEvent ) {
		this.picked.emit( event );
		this.close();
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public open( event?: Event ) {
		if ( this.isOpened ) return;

		// Create file picker instance
		this._instance = this._createOverlay().attach( this._createPortal() ).instance;

		// Bind instance's attributes
		this._instance.fileAccept = this.fileAccept;
		this._instance.googleDriveMimeTypes = this.googleDriveMimeTypes;
		this._instance.dropboxExtensions = this.dropboxExtensions;
		this._instance.oneDriveExtensions = this.oneDriveExtensions;
		this._instance.multiSelect = this.multiSelect;
		this._instance.imageOnly = this.imageOnly;
		this._instance.useAuthorizedKey = this.useAuthorizedKey;

		// Bind instance's methods
		this._instance.close = this.close.bind( this );
		this._instance.onPicked = this.onFilePicked.bind( this );

		// Emit on opened event
		this.opened.emit( event );

		this._cdRef.markForCheck();
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public close( event?: Event ) {
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
	 * @return {OverlayRef}
	 */
	private _createOverlay(): OverlayRef {
		const config: OverlayConfig = new OverlayConfig({
			panelClass		: this.panelClass,
			backdropClass	: this.backdropClass,
			hasBackdrop		: this.hasBackdrop,
			width			: this.width,
			minWidth		: parseFloat( this.minWidth ) < window.innerWidth ? this.minWidth : undefined,
			maxWidth		: this.maxWidth,
			height			: this.height,
			minHeight		: parseFloat( this.minHeight ) < window.innerHeight ? this.minHeight : undefined,
			maxHeight		: this.maxHeight,
			scrollStrategy	: this._overlay.scrollStrategies.reposition({ autoClose: true, scrollThrottle: 1000 }),
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
		overlayRef.setDirection( this.direction );

		// On keyboard events
		overlayRef
		.keydownEvents()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: KeyboardEvent ) => {
			if ( event.key !== 'Escape' ) return;

			event.stopPropagation();
			event.preventDefault();
			this.close( event );
		} );

		// On outside pointer events
		overlayRef
		.outsidePointerEvents()
		.pipe(
			debounceTime( 0 ),
			skipWhile( ( event: MouseEvent ): boolean => {
				return this._elementRef.nativeElement === event.target
					|| this._elementRef.nativeElement.contains( event.target );
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( event: MouseEvent ) => {
			this.closeOnClickOutside && this.close( event );
		} );

		// On backdrop click
		overlayRef
		.backdropClick()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: MouseEvent ) => {
			this.backdropPress.emit( event );
		} );

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

		return this._overlayRef = overlayRef;
	}

	/**
	 * @return {FlexibleConnectedPositionStrategy}
	 */
	private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
		const originX: HorizontalConnectionPos = this.originX || 'start';
		let originY: VerticalConnectionPos = this.originY;
		let originFallbackX: HorizontalConnectionPos = originX;
		let originFallbackY: VerticalConnectionPos = originY;
		const overlayX: HorizontalConnectionPos = this.overlayX || 'start';
		let overlayY: VerticalConnectionPos = this.overlayY;
		let overlayFallbackX: HorizontalConnectionPos = overlayX;
		let overlayFallbackY: VerticalConnectionPos = overlayY;
		const offsetX: number = +( this.offsetX || 0 );
		let offsetY: number = +( this.offsetY || 0 );

		switch ( this.position ) {
			case 'above':
			case 'below':
				if ( !this.originY ) originY = this.position === 'above' ? 'top' : 'bottom';
				if ( !this.overlayY ) overlayY = this.position === 'above' ? 'bottom' : 'top';
				if ( _.isNil( this.offsetY ) ) offsetY = this.position === 'above' ? -5 : 5;
				break;
		}

		originFallbackX = this._fallbackX( originX );
		originFallbackY = this._fallbackY( originY );
		overlayFallbackX = this._fallbackX( overlayX );
		overlayFallbackY = this._fallbackY( overlayY );

		return this._overlay
		.position()
		.flexibleConnectedTo( this._elementRef )
		.withFlexibleDimensions( false )
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
				offsetX: -offsetX, offsetY,
			},
			{
				originX, originY: originFallbackY,
				overlayX, overlayY: overlayFallbackY,
				offsetX, offsetY: -offsetY,
			},
			{
				originX: originFallbackX, originY: originFallbackY,
				overlayX: overlayFallbackX, overlayY: overlayFallbackY,
				offsetX: -offsetX, offsetY: -offsetY,
			},
		]);
	}

	/**
	 * @return {ComponentPortal<WGCFilePickerComponent>}
	 */
	private _createPortal(): ComponentPortal<WGCFilePickerComponent> {
		return this._portal ||= new ComponentPortal( WGCFilePickerComponent, this._vcRef );
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
