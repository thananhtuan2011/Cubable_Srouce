import { Injectable, TemplateRef } from '@angular/core';
import { OverlayRef, Overlay, PositionStrategy, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Router, NavigationStart } from '@angular/router';
import { Subject, ReplaySubject } from 'rxjs';
import {
	filter, map, takeUntil,
	pairwise, take, delay
} from 'rxjs/operators';
import _ from 'lodash';

import { WGCConfirmComponent, WGCIConfirmConfig } from './wgc-confirm.component';

export interface WGCIConfirmRef {
	instance: WGCConfirmComponent;
	config: WGCIConfirmConfig;
	close: ( answer?: boolean ) => void;
	afterOpened: () => ReplaySubject<WGCConfirmComponent>;
	afterClosed: () => ReplaySubject<boolean>;
}

let overlayRefs: OverlayRef[] = [];

@Injectable({ providedIn: 'any' })
export class WGCConfirmService {

	public opened$: Subject<WGCConfirmComponent> = new Subject<WGCConfirmComponent>();
	public closed$: Subject<boolean> = new Subject<boolean>();

	private _overlayRef: OverlayRef;
	private _confirmRef: WGCIConfirmRef;
	private _defaultConfig: WGCIConfirmConfig = {
		autoClose	: true,
		hasBackdrop	: true,
		translate	: true,
		type		: 'dialog',
	};

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {Router} _router
	 */
	constructor( private _overlay: Overlay, private _router: Router ) {
		// On router events changes
		this._router.events
		.pipe(
			filter( ( event: NavigationStart ) => event instanceof NavigationStart ),
			map( ( event: NavigationStart ) => event.url.split( '?' )[ 0 ] ),
			pairwise()
		)
		.subscribe( ( results: string[] ) => results[ 0 ] !== results[ 1 ] && this.closeAll() );
	}

	/**
	 * @param {string | TemplateRef<any>} message
	 * @param {string=} title
	 * @param {WGCIDialogConfig=} config
	 * @return {WGCIConfirmRef}
	 */
	public open( message: string | TemplateRef<any>, title?: string, config?: WGCIConfirmConfig ): WGCIConfirmRef {
		// Close all opening before open new confirmation popup
		this.closeAll();

		const confirmRef: WGCIConfirmRef = this._createConfirm( message, title, { ...this._defaultConfig, ...config } );

		confirmRef.afterOpened().next( confirmRef.instance );
		this.opened$.next( confirmRef.instance );

		return confirmRef;
	}

	/**
	 * @param {boolean=} answer
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public close( answer: boolean = false, overlayRef: OverlayRef = this._overlayRef ) {
		const confirmRef: WGCIConfirmRef = this._getConfirmRef( overlayRef );

		if ( !confirmRef ) return;

		overlayRef.dispose();
		confirmRef.afterClosed().next( answer );
		this.closed$.next( answer );
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		_.forEach( overlayRefs, ( overlayRef: OverlayRef ) => { overlayRef.dispose(); } );

		overlayRefs = [];
	}

	/**
	 * @param {WGCIDialogConfig=} config
	 * @return {OverlayRef}
	 */
	private _createOverlay( config?: WGCIConfirmConfig ): OverlayRef {
		const isDialogType: boolean = config?.type === 'dialog';
		const hasBackdrop: boolean = config?.hasBackdrop;
		const backdropClass: string = config?.backdropClass;
		const panelClass: string = config?.panelClass;
		const positionStrategy: PositionStrategy = this._overlay
		.position()
		.global()
		.centerHorizontally()
		.centerVertically();
		const overlayConfig: OverlayConfig = new OverlayConfig({
			positionStrategy, hasBackdrop,
			width			: isDialogType ? '440px' : undefined,
			backdropClass	: [ isDialogType ? 'wgc-dialog-backdrop' : 'wgc-confirm-backdrop', backdropClass ],
			panelClass		: [ isDialogType ? 'wgc-dialog-panel' : 'wgc-confirm-panel', panelClass ],
		});
		const overlayRef: OverlayRef = this._overlay.create( overlayConfig );

		// Push overlay ref to global
		overlayRefs.push( overlayRef );

		// On keyboard events
		overlayRef
		.keydownEvents()
		.pipe( takeUntil( overlayRef.detachments() ) )
		.subscribe( ( event: KeyboardEvent ) => {
			if ( event.key !== 'Escape' ) return;

			event.stopPropagation();
			event.preventDefault();
			this.close( undefined, overlayRef );
		} );

		// On outside pointer events
		overlayRef
		.outsidePointerEvents()
		.pipe( takeUntil( overlayRef.detachments() ) )
		.subscribe( () => {
			config?.autoClose && this.close();
		} );

		// On attach
		overlayRef
		.attachments()
		.pipe( delay( 0 ), take( 1 ) )
		.subscribe( () => this._confirmRef.afterOpened().complete() );

		// On detach
		overlayRef
		.detachments()
		.pipe( delay( 0 ), take( 1 ) )
		.subscribe( () => this._confirmRef.afterClosed().complete() );

		return this._overlayRef = overlayRef;
	}

	/**
	 * @param {string | TemplateRef<any>} message
	 * @param {string=} title
	 * @param {WGCIDialogConfig=} config
	 * @return {WGCIConfirmRef}
	 */
	private _createConfirm( message: string | TemplateRef<any>, title?: string, config?: WGCIConfirmConfig ): WGCIConfirmRef {
		const overlayRef: OverlayRef = this._createOverlay( config );
		const portal: ComponentPortal<WGCConfirmComponent> = new ComponentPortal( WGCConfirmComponent, config.viewContainerRef );
		const instance: WGCConfirmComponent = overlayRef.attach( portal ).instance;
		const opened$: ReplaySubject<WGCConfirmComponent> = new ReplaySubject<WGCConfirmComponent>();
		const closed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();
		const closeFn: typeof this.close = ( answer: boolean ) => this.close( answer, overlayRef );
		const confirmRef: WGCIConfirmRef = {
			config, instance,
			close		: closeFn,
			afterOpened	: (): ReplaySubject<WGCConfirmComponent> => opened$,
			afterClosed	: (): ReplaySubject<boolean> => closed$,
		} as WGCIConfirmRef;

		// Bind instance's attributes
		instance.message = message;
		instance.title = title;
		instance.config = config;

		// Bind instance's methods
		instance.close = closeFn;

		return this._confirmRef = ( overlayRef as any )._confirmRef = confirmRef;
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {WGCIConfirmRef}
	 */
	private _getConfirmRef( overlayRef: OverlayRef = this._overlayRef ): WGCIConfirmRef {
		if ( !overlayRef ) return;

		return ( overlayRef as any )._confirmRef || this._confirmRef;
	}

}
