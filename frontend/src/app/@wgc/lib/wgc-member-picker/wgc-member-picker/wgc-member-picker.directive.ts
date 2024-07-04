import {
	Input, Output, OnDestroy,
	OnChanges, Directive, HostListener,
	EventEmitter, ElementRef, ViewContainerRef,
	SimpleChanges
} from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { ComponentPortal } from '@angular/cdk/portal';
import {
	Overlay, OverlayRef, OverlayConfig,
	FlexibleConnectedPositionStrategy, HorizontalConnectionPos, VerticalConnectionPos,
	PositionStrategy
} from '@angular/cdk/overlay';
import { Subject, Observable } from 'rxjs';
import { skipWhile, debounceTime } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	CoerceBoolean, CoerceCssPixel, CoerceNumber,
	DefaultValue, Memoize, Unsubscriber,
	untilCmpDestroyed
} from '@core';

import { WGCIMember, WGCIMemberStatus } from '../wgc-member/wgc-member';

import { WGCMemberPickerComponent } from './wgc-member-picker.component';

export type WGCIMemberPickerPosition = 'above' | 'below' | 'before' | 'after';

@Unsubscriber()
@Directive({ selector: '[wgcMemberPicker]', exportAs: 'wgcMemberPicker' })
export class WGCMemberPickerDirective implements OnDestroy, OnChanges {

	@Input() public panelClass: string | string[];
	@Input() @DefaultValue() public backdropClass: string | string[] = [ 'cdk-overlay-transparent-backdrop' ];
	@Input() @CoerceBoolean() public hasBackdrop: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public closeOnClickOutside: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public strictDisplay: boolean = true;
	@Input() @CoerceNumber() public offsetX: number;
	@Input() @CoerceNumber() public offsetY: number;
	@Input() @DefaultValue() @CoerceNumber() public itemSize: number = 44;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @DefaultValue() public position: WGCIMemberPickerPosition = 'below';
	@Input() @DefaultValue() public direction: Direction = 'ltr';
	@Input() @CoerceBoolean() public isAutoOpen: boolean;
	@Input() @CoerceBoolean() public canViewProfile: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public scrolling$: Subject<any>;
	@Input() public context: ObjectType;
	@Input() public selected: string[];
	@Input() public selectedMembers: WGCIMember[];
	@Input() public includesStatus: WGCIMemberStatus[];
	@Input() public members: WGCIMember[] | Observable<WGCIMember[]> | Function;
	@Input() public originX: HorizontalConnectionPos;
	@Input() public originY: VerticalConnectionPos;
	@Input() public overlayX: HorizontalConnectionPos;
	@Input() public overlayY: VerticalConnectionPos;

	@Output() public opened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public added: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();
	@Output() public removed: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();
	@Output() public viewDetail: EventEmitter<WGCIMember> = new EventEmitter<WGCIMember>();
	@Output() public selectedChange: EventEmitter<string[]> = new EventEmitter<string[]>();
	@Output() public selectedMembersChange: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();
	@Output() public backdropPress: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	public isOpened: boolean;

	private _portal: ComponentPortal<WGCMemberPickerComponent>;
	private _instance: WGCMemberPickerComponent;
	private _overlayRef: OverlayRef;

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

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 * @return {void}
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.isAutoOpen && this.isAutoOpen && this.open();

		if ( !this._instance ) return;

		if ( changes.selected ) {
			this._instance.selected = this.selected;

			this._instance.markAsSelectedChanges();
		}

		if ( changes.selectedMembers ) {
			this._instance.selectedMembers = this.selectedMembers;

			this._instance.markAsSelectedMembersChanges();
		}

		if ( changes.includesStatus ) {
			this._instance.includesStatus = this.includesStatus;

			this._instance.markAsIncludesStatusChanges();
		}

		if ( changes.members ) {
			this._instance.members = this.members;

			this._instance.markAsMembersChanges();
		}

		if ( changes.canViewProfile ) this._instance.canViewProfile = this.canViewProfile;
		if ( changes.required ) this._instance.required = this.required;
	}

	// tslint:disable-next-line:jsdoc-require
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
	 */
	ngOnDestroy() {
		this._overlayRef?.dispose();
	}

	/**
	 * @param {WGCIMember[]} members
	 * @return {void}
	 */
	public onMembersAdded( members: WGCIMember[] ) {
		this.added.emit( members );
	}

	/**
	 * @param {WGCIMember[]} members
	 * @return {void}
	 */
	public onMembersRemoved( members: WGCIMember[] ) {
		this.removed.emit( members );
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public onViewProfile( member: WGCIMember ) {
		this.viewDetail.emit( member );
	}

	/**
	 * @param {WGCIMember[]} selectedMembers
	 * @param {string[]} selected
	 * @return {void}
	 */
	public onDone( selectedMembers: WGCIMember[], selected: string[] ) {
		if ( this.required && !selected?.length ) return;

		this.selectedMembersChange.emit( selectedMembers );
		this.selectedChange.emit( selected );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public open( event?: Event ) {
		if ( this.isOpened ) return;

		// Create member picker instance
		this._instance = this._createOverlay().attach( this._createPortal() ).instance;

		// Bind instance's attributes
		this._instance.itemSize = this.itemSize;
		this._instance.strictDisplay = this.strictDisplay;
		this._instance.canViewProfile = this.canViewProfile;
		this._instance.required = this.required;
		this._instance.name = this.name;
		this._instance.label = this.label;
		this._instance.scrolling$ = this.scrolling$;
		this._instance.context = this.context;
		this._instance.selected = this.selected;
		this._instance.selectedMembers = this.selectedMembers;
		this._instance.includesStatus = this.includesStatus;
		this._instance.members = this.members;

		// Bind instance's methods
		this._instance.close = this.close.bind( this );
		this._instance.onMembersAdded = this.onMembersAdded.bind( this );
		this._instance.onMembersRemoved = this.onMembersRemoved.bind( this );
		this._instance.onViewProfile = this.onViewProfile.bind( this );
		this._instance.onDone = this.onDone.bind( this );

		// Mark instance's states
		this._instance.markAsIncludesStatusChanges();
		this._instance.markAsMembersChanges();
		this._instance.markAsSelectedChanges();
		this._instance.markAsSelectedMembersChanges();

		// Emit on opened event
		this.opened.emit( event );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public close( event?: Event ) {
		if ( !this.isOpened ) return;

		this._instance.markAsDone();
		this._overlayRef?.dispose();

		this.closed.emit( event );
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
			maxWidth		: this.maxHeight,
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

		// Element for which to observe height and width
		resizeObserver.observe( overlayRef.overlayElement );

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
		let originX: HorizontalConnectionPos = this.originX || 'start';
		let originY: VerticalConnectionPos = this.originY || 'center';
		let originFallbackX: HorizontalConnectionPos = originX;
		let originFallbackY: VerticalConnectionPos = originY;
		let overlayX: HorizontalConnectionPos = this.overlayX || 'start';
		let overlayY: VerticalConnectionPos = this.overlayY || 'center';
		let overlayFallbackX: HorizontalConnectionPos = overlayX;
		let overlayFallbackY: VerticalConnectionPos = overlayY;
		let offsetX: number = +( this.offsetX || 0 );
		let offsetY: number = +( this.offsetY || 0 );

		switch ( this.position ) {
			case 'above':
			case 'below':
				if ( !this.originY ) originY = this.position === 'above' ? 'top' : 'bottom';
				if ( !this.overlayY ) overlayY = this.position === 'above' ? 'bottom' : 'top';
				if ( _.isNil( this.offsetY ) ) offsetY = this.position === 'above' ? -5 : 5;
				break;
			case 'before':
			case 'after':
				if ( !this.originX ) originX = this.position === 'before' ? 'start' : 'end';
				if ( !this.overlayX ) overlayX = this.position === 'before' ? 'end' : 'start';
				if ( _.isNil( this.offsetX ) ) offsetX = this.position === 'before' ? -5 : 5;
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
	 * @return {ComponentPortal<WGCMemberPickerComponent>}
	 */
	private _createPortal(): ComponentPortal<WGCMemberPickerComponent> {
		return this._portal ||= new ComponentPortal( WGCMemberPickerComponent, this._vcRef );
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
