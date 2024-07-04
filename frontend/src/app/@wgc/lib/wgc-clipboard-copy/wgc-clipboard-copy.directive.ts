import {
	Directive, Input, HostListener,
	Output, EventEmitter, ViewContainerRef,
	ElementRef, OnDestroy
} from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TranslateService } from '@ngx-translate/core';
import { skipWhile, debounceTime } from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, untilCmpDestroyed
} from '@core';

import { WGCTooltipComponent } from '../wgc-tooltip';

@Unsubscriber()
@Directive({ selector: '[wgcClipboardCopy]', exportAs: 'wgcClipboardCopy' })
export class WGCClipboardCopyDirective implements OnDestroy {

	@Input( 'wgcClipboardCopy' ) public clipboardCopy: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() public copiedMessage: string;
	@Input() @DefaultValue() @CoerceNumber() public displayTime: number = 1500;

	@Output() public copied: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	public isCopied: boolean;

	private _timeout: NodeJS.Timeout;
	private _overlayRef: OverlayRef;
	private _portal: ComponentPortal<WGCTooltipComponent>;

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {ViewContainerRef} _vcRef
	 * @param {ElementRef} _elementRef
	 * @param {TranslateService} _translateService
	 */
	constructor(
		private _overlay: Overlay,
		private _vcRef: ViewContainerRef,
		private _elementRef: ElementRef,
		private _translateService: TranslateService
	) {}

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: MouseEvent ) {
		if ( this.disabled ) return;

		event.stopPropagation();
		navigator.clipboard.writeText( _.toString( this.clipboardCopy ) );
		this._openCopiedTooltip();
		this.copied.emit( event );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		clearTimeout( this._timeout );
		this._overlayRef?.dispose();
	}

	/**
	 * @return {void}
	 */
	private _openCopiedTooltip() {
		if ( this.isCopied ) return;

		// Create instance
		const instance: WGCTooltipComponent = this._createOverlay().attach( this._createPortal() ).instance;

		// Bind instance's attributes
		instance.messageOnly = true;
		instance.message = this.copiedMessage || this._translateService.instant( 'WGC.LABEL.COPIED' );

		// Set above position
		instance.setPositionClasses( 'above' );

		// Delay to close tooltip
		this._timeout = setTimeout( this._closeCopiedTooltip.bind( this ), this.displayTime );
	}

	/**
	 * @return {void}
	 */
	private _closeCopiedTooltip() {
		if ( !this.isCopied ) return;

		this._overlayRef.dispose();
	}

	/**
	 * @return {OverlayRef}
	 */
	private _createOverlay(): OverlayRef {
		const config: OverlayConfig = new OverlayConfig({
			scrollStrategy: this._overlay.scrollStrategies.close(),
			positionStrategy: this._overlay
			.position()
			.flexibleConnectedTo( this._elementRef )
			.withLockedPosition()
			.withPush( true )
			.withPositions([{
				originX	: 'center',
				originY	: 'top',
				overlayX: 'center',
				overlayY: 'bottom',
				offsetX	: 0,
				offsetY	: -15,
			}]),
		});
		const overlayRef: OverlayRef = this._overlay.create( config );

		// Set overlay direction
		overlayRef.setDirection( 'ltr' );

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
		.subscribe( this._closeCopiedTooltip.bind( this ) );

		// On attach
		overlayRef
		.attachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => { this.isCopied = true; } );

		// On detach
		overlayRef
		.detachments()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => { this.isCopied = false; } );

		return this._overlayRef = overlayRef;
	}

	/**
	 * @return {ComponentPortal<WGCTooltipComponent>}
	 */
	private _createPortal(): ComponentPortal<WGCTooltipComponent> {
		return this._portal ||= new ComponentPortal( WGCTooltipComponent, this._vcRef );
	}

}
