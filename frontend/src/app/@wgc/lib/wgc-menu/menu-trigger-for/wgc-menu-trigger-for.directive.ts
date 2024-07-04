import {
	ElementRef, HostListener, Input,
	Directive, EventEmitter, Output,
	ViewContainerRef, OnDestroy
} from '@angular/core';
import {
	Overlay, OverlayRef, HorizontalConnectionPos,
	VerticalConnectionPos, OverlayConfig, FlexibleConnectedPositionStrategy,
	GlobalPositionStrategy, ConnectedOverlayPositionChange, PositionStrategy
} from '@angular/cdk/overlay';
import { Direction } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeWhile, skipWhile } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, CoerceCssPixel, Memoize,
	untilCmpDestroyed
} from '@core';

import { WGCMenuComponent, WGCIMenuPosition, WGCIMenuDirection } from '../menu/wgc-menu.component';

@Unsubscriber()
@Directive({ selector: '[wgcMenuTriggerFor]', exportAs: 'wgcMenuTriggerFor' })
export class WGCMenuTriggerForDirective implements OnDestroy {

	@Input() public panelClass: string | string[];
	@Input() @DefaultValue() public backdropClass: string | string[] = 'cdk-overlay-transparent-backdrop';
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public programmatically: boolean;
	@Input() @CoerceBoolean() public autoFit: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public isContextMenu: boolean;
	@Input() @CoerceBoolean() public hasBackdrop: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public closeOnClickOutside: boolean = true;
	@Input() @CoerceNumber() public offsetX: number;
	@Input() @CoerceNumber() public offsetY: number;
	@Input() public originX: HorizontalConnectionPos;
	@Input() public originY: VerticalConnectionPos;
	@Input() public overlayX: HorizontalConnectionPos;
	@Input() public overlayY: VerticalConnectionPos;
	@Input() @DefaultValue() public layoutDir: Direction = 'ltr';
	@Input() @DefaultValue() public position: WGCIMenuPosition = 'below';
	@Input() public menuData: ObjectType;

	@Output() public menuInit: EventEmitter<WGCMenuTriggerForDirective> = new EventEmitter<WGCMenuTriggerForDirective>();
	@Output() public menuOpened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public menuClosed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public menuBackdropPress: EventEmitter<Event> = new EventEmitter<Event>();

	private _isMenuOpened: boolean;
	private _menu: WGCMenuComponent;
	private _overlayRef: OverlayRef;
	private _portal: TemplatePortal;

	@Input( 'wgcMenuTriggerFor' )
	get menu(): WGCMenuComponent { return this._menu; }
	set menu( menu: WGCMenuComponent ) {
		if ( menu === this._menu ) return;

		this._menu = menu;

		this.menuInit.emit( this );
	}

	get isMenuOpened(): boolean { return this._isMenuOpened; }
	set isMenuOpened( value: boolean ) {
		if ( !this.menu ) return;

		this._isMenuOpened = this.menu.isOpened = value;
	}

	get canOpenMenu(): boolean {
		return !this.disabled
			&& !this.programmatically
			&& !this.isMenuOpened;
	}

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {ElementRef} _elementRef
	 * @param {ViewContainerRef} _vcRef
	 */
	constructor(
		private _overlay: Overlay,
		private _elementRef: ElementRef,
		private _vcRef: ViewContainerRef
	) {}

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public onClicked( event: Event ) {
		if ( this.isContextMenu || !this.canOpenMenu ) return;

		event.stopPropagation();
		event.preventDefault();
		this.open( event );
	}

	@HostListener( 'contextmenu', [ '$event' ] )
	public onRightClicked( event: MouseEvent ) {
		if ( !this.canOpenMenu ) return;

		this.offsetX = event.pageX;
		this.offsetY = event.pageY;

		event.stopPropagation();
		event.preventDefault();
		this.open( event );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._overlayRef?.dispose();
	}

	/**
	 * @param {Event=} event
	 * @param {ObjectType=} data
	 * @return {void}
	 */
	public open( event?: Event, data?: ObjectType ) {
		if ( !this.menu || this.isMenuOpened ) return;

		// Bind menu's methods
		this.menu.close = this.close.bind( this );
		this.menu.reopen = this.reopen.bind( this );

		// Mark menu as opened
		this.menu.markAsOpened({ ...data, ...this.menuData });

		// Attach portal to overlay
		this._createOverlay().attach( this._createPortal() );

		// Emit on opened event
		this.menuOpened.emit( event );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public close( event?: Event ) {
		if ( !this.isMenuOpened ) return;

		this._overlayRef.dispose();
		this.menu?.markAsClosed();
		this.menuClosed.emit( event );
	}

	/**
	 * @return {void}
	 */
	public reopen() {
		if ( !this.isMenuOpened ) return;

		this._overlayRef.detach();
		this._overlayRef.attach( this._createPortal() );
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
			panelClass		: this.panelClass ?? this.menu.panelClass,
			backdropClass	: this.backdropClass ?? this.menu.backdropClass,
			hasBackdrop		: this.hasBackdrop ?? this.menu.hasBackdrop,
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
		overlayRef.setDirection( this.layoutDir );

		// On keyboard events
		overlayRef
		.keydownEvents()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: KeyboardEvent ) => {
			switch ( event.key ) {
				case 'ArrowDown':
					if ( !this.menu.menuItems.length ) return;
					event.stopPropagation();
					event.preventDefault();
					this.menu.focusNextItem( event );
					break;
				case 'ArrowUp':
					if ( !this.menu.menuItems.length ) return;
					event.stopPropagation();
					event.preventDefault();
					this.menu.focusPreviousItem( event );
					break;
				case 'Enter':
					if ( !this.menu.menuItems.length ) return;
					event.stopPropagation();
					event.preventDefault();
					this.menu.chooseItem( event );
					break;
				case 'Escape':
					event.stopPropagation();
					event.preventDefault();
					this.close( event );
					break;
			}
		} );

		// On outside pointer events
		overlayRef
		.outsidePointerEvents()
		.pipe(
			skipWhile( ( event: MouseEvent ): boolean => {
				return ( this.isContextMenu && event.type === 'auxclick' )
					|| this._elementRef.nativeElement === event.target
					|| this._elementRef.nativeElement.contains( event.target );
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( event: MouseEvent ) => {
			this.closeOnClickOutside
				&& this.menu.closeOnClickOutside
				&& this.close( event );
		} );

		// On backdrop click
		overlayRef
		.backdropClick()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: MouseEvent ) => {
			this.menuBackdropPress.emit( event );
			this.menu.backdropPress.emit( event );
		} );

		// On attach
		overlayRef
		.attachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.isMenuOpened = true;

			// Element for which to observe height and width
			resizeObserver.observe( overlayRef.overlayElement );
		} );

		// On detach
		overlayRef
		.detachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.isMenuOpened = false;

			resizeObserver?.disconnect();
		} );

		// On position changes
		!this.isContextMenu && ( overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy ).positionChanges
		.pipe(
			takeWhile( () => !!this.position ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( change: ConnectedOverlayPositionChange ) => {
			const _originX: HorizontalConnectionPos = change.connectionPair.originX;
			const _originY: VerticalConnectionPos = change.connectionPair.originY;
			const _overlayX: HorizontalConnectionPos = change.connectionPair.overlayX;
			const _overlayY: VerticalConnectionPos = change.connectionPair.overlayY;
			let position: WGCIMenuPosition;
			let direction: WGCIMenuDirection;

			if ( _originX === 'center' ) {
				position = _originY === 'top' ? 'above' : 'below';

				if ( _overlayX !== 'center' ) direction = _overlayX === 'start' ? 'start' : 'end';
			}

			if ( _originY === 'center' ) {
				position = _originX === 'start' ? 'before' : 'after';

				if ( _overlayY !== 'center' ) direction = _overlayY === 'top' ? 'start' : 'end';
			}

			this.menu.setPositionClasses( position, direction );
		} );

		// Bind sizes to menu
		const minWidth: string = this.minWidth ?? this.menu.minWidth;
		const minHeight: string = this.minHeight ?? this.menu.minHeight;

		this.menu.width = this.width ?? this.menu.width;
		this.menu.minWidth = parseFloat( minWidth ) < window.innerWidth ? minWidth : undefined;
		this.menu.maxWidth = this.maxWidth ?? this.menu.maxWidth;
		this.menu.height = this.height ?? this.menu.height;
		this.menu.minHeight = parseFloat( minHeight ) < window.innerHeight ? minHeight : undefined;
		this.menu.maxHeight = this.maxHeight ?? this.menu.maxHeight;

		return this._overlayRef = overlayRef;
	}

	/**
	 * @return {FlexibleConnectedPositionStrategy | GlobalPositionStrategy}
	 */
	private _createPositionStrategy(): FlexibleConnectedPositionStrategy | GlobalPositionStrategy {
		if ( this.isContextMenu ) {
			return this._overlay
			.position()
			.global()
			.left( this.offsetX + 'px' )
			.top( this.offsetY + 'px' );
		}

		// Auto fit menu position
		if ( this.autoFit ) {
			switch ( this.position ) {
				case 'above':
				case 'below':
					this.originX ||= 'start';
					this.originY ||= this.position === 'above' ? 'top' : 'bottom';
					this.overlayX ||= 'start';
					this.overlayY ||= this.position === 'above' ? 'bottom' : 'top';
					this.offsetX ||= 0;
					this.offsetY ||= 0;
					this.width = this._elementRef.nativeElement.clientWidth;
					break;
				case 'before':
				case 'after':
					this.originX ||= this.position === 'before' ? 'start' : 'end';
					this.originY ||= 'top';
					this.overlayX ||= this.position === 'before' ? 'end' : 'start';
					this.overlayY ||= 'top';
					this.offsetX ||= 0;
					this.offsetY ||= 0;
					this.height = this._elementRef.nativeElement.clientHeight;
					break;
			}
		}

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
	 * @return {TemplatePortal}
	 */
	private _createPortal(): TemplatePortal {
		if ( !this._portal || this._portal.templateRef !== this.menu.templateRef ) {
			this._portal = new TemplatePortal( this.menu?.templateRef, this._vcRef );
		}

		return this._portal;
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
