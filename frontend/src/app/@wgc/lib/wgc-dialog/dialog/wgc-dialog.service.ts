import { Injectable, Injector, ViewContainerRef } from '@angular/core';
import { OverlayRef, Overlay, PositionStrategy, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal, ComponentType } from '@angular/cdk/portal';
import { Router, NavigationStart } from '@angular/router';
import { Subject, ReplaySubject } from 'rxjs';
import {
	filter, map, takeUntil,
	pairwise, delay, take
} from 'rxjs/operators';
import _ from 'lodash';

import { WGCDialogContainerComponent, WGCIDialogPagerType } from '../dialog-container/wgc-dialog-container.component';

export const WGC_DIALOG_DATA: string = 'WGC_DIALOG_DATA';
export const WGC_DIALOG_REF: string = 'WGC_DIALOG_REF';

export interface WGCIDialogRef {
	container: WGCDialogContainerComponent;
	config: WGCIDialogConfig;
	isFreezing: boolean;
	isFullscreen: boolean;
	close: ( data?: any ) => void;
	freeze: () => void;
	unfreeze: () => void;
	fullscreen: () => void;
	exitFullscreen: () => void;
	pagerClick: ( type: WGCIDialogPagerType ) => void;
	enablePager: ( type?: WGCIDialogPagerType ) => void;
	disablePager: ( type?: WGCIDialogPagerType ) => void;
	showPager: ( type?: WGCIDialogPagerType ) => void;
	hidePager: ( type?: WGCIDialogPagerType ) => void;
	afterOpened: () => ReplaySubject<ComponentType<any>>;
	afterClosed: () => ReplaySubject<any>;
	afterFreezed: () => ReplaySubject<void>;
	afterUnfreezed: () => ReplaySubject<void>;
	afterFullscreen: () => ReplaySubject<void>;
	afterExitFullscreen: () => ReplaySubject<void>;
	afterPagerClicked: () => ReplaySubject<WGCIDialogPagerType>;
	afterPagerEnabled: () => ReplaySubject<WGCIDialogPagerType>;
	afterPagerDisabled: () => ReplaySubject<WGCIDialogPagerType>;
	afterPagerShowed: () => ReplaySubject<WGCIDialogPagerType>;
	afterPagerHidden: () => ReplaySubject<WGCIDialogPagerType>;
	onBeforeClose?: ( ...args ) => any;
	onBeforeAutoClose?: ( ...args ) => any;
}

export interface WGCIDialogConfig {
	height?: string;
	minHeight?: string;
	maxHeight?: string;
	width?: string;
	minWidth?: string;
	maxWidth?: string;
	panelClass?: string;
	backdropClass?: string;
	hasBackdrop?: boolean;
	autoClose?: boolean;
	fullscreen?: boolean;
	pager?: boolean;
	viewContainerRef?: ViewContainerRef;
	data?: ObjectType;
}

let overlayRefs: OverlayRef[] = [];

@Injectable({ providedIn: 'any' })
export class WGCDialogService {

	public opened$: Subject<ComponentType<any>> = new Subject<ComponentType<any>>();
	public closed$: Subject<any> = new Subject<any>();
	public freezed$: Subject<void> = new Subject<void>();
	public unfreezed$: Subject<void> = new Subject<void>();
	public fullscreen$: Subject<void> = new Subject<void>();
	public exitFullscreen$: Subject<void> = new Subject<void>();
	public pagerClicked$: Subject<WGCIDialogPagerType> = new Subject<WGCIDialogPagerType>();
	public pagerEnabled$: Subject<WGCIDialogPagerType> = new Subject<WGCIDialogPagerType>();
	public pagerDisabled$: Subject<WGCIDialogPagerType> = new Subject<WGCIDialogPagerType>();
	public pagerShowed$: Subject<WGCIDialogPagerType> = new Subject<WGCIDialogPagerType>();
	public pagerHidden$: Subject<WGCIDialogPagerType> = new Subject<WGCIDialogPagerType>();

	private _defaultConfig: WGCIDialogConfig = { autoClose: true };
	private _overlayRef: OverlayRef;
	private _dialogRef: WGCIDialogRef;

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 * @param {Injector} _injector
	 * @param {Router} _router
	 */
	constructor(
		private _overlay: Overlay,
		private _injector: Injector,
		private _router: Router
	) {
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
	 * @param {ComponentType} component
	 * @param {WGCIDialogConfig=} config
	 * @return {WGCIDialogRef}
	 */
	public open( component: any, config?: WGCIDialogConfig ): WGCIDialogRef {
		const dialogRef: WGCIDialogRef = this._createDialog( component, { ...this._defaultConfig, ...config } );

		// Emit opened event
		dialogRef.afterOpened().next( component );
		this.opened$.next( component );

		return dialogRef;
	}

	/**
	 * @param {any} data
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public close( data?: any, overlayRef: OverlayRef | any = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef || dialogRef.isFreezing ) return;

		if ( _.isFunction( dialogRef.onBeforeClose ) ) data = dialogRef.onBeforeClose( data );

		overlayRef.dispose();
		dialogRef.afterClosed().next( data );
		this.closed$.next( data );
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		_.forEach( overlayRefs, ( overlayRef: OverlayRef ) => { overlayRef.dispose(); } );

		overlayRefs = [];
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public freeze( overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.isFreezing = dialogRef.container.isFreezing = true;

		dialogRef.afterFreezed().next();
		this.freezed$.next();
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public unfreeze( overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.isFreezing = dialogRef.container.isFreezing = false;

		dialogRef.afterUnfreezed().next();
		this.unfreezed$.next();
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public fullscreen( overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.isFullscreen = dialogRef.container.isFullscreen = true;

		overlayRef.addPanelClass( 'wgc-dialog-panel--fullscreen' );
		dialogRef.afterFullscreen().next();
		this.fullscreen$.next();
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public exitFullscreen( overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.isFullscreen = dialogRef.container.isFullscreen = false;

		overlayRef.removePanelClass( 'wgc-dialog-panel--fullscreen' );
		dialogRef.afterExitFullscreen().next();
		this.exitFullscreen$.next();
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public pagerClick( type: WGCIDialogPagerType, overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.afterPagerClicked().next( type );
		this.pagerClicked$.next( type );
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public enablePager( type?: WGCIDialogPagerType, overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.container.enablePager( type );
		dialogRef.afterPagerEnabled().next( type );
		this.pagerEnabled$.next( type );
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public disablePager( type?: WGCIDialogPagerType, overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.container.disablePager( type );
		dialogRef.afterPagerDisabled().next( type );
		this.pagerDisabled$.next( type );
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public showPager( type?: WGCIDialogPagerType, overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.container.showPager( type );
		dialogRef.afterPagerShowed().next( type );
		this.pagerShowed$.next( type );
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	public hidePager( type?: WGCIDialogPagerType, overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

		if ( !dialogRef ) return;

		dialogRef.container.hidePager( type );
		dialogRef.afterPagerHidden().next( type );
		this.pagerHidden$.next( type );
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {void}
	 */
	private _autoClose( overlayRef: OverlayRef = this._overlayRef ) {
		const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );
		const data: any = _.isFunction( dialogRef.onBeforeAutoClose )
			? dialogRef.onBeforeAutoClose( this._overlayRef )
			: null;

		this.close( data, overlayRef );
	}

	/**
	 * @param {WGCIDialogConfig=} config
	 * @return {OverlayRef}
	 */
	private _createOverlay( config?: WGCIDialogConfig ): OverlayRef {
		const hasBackdrop: boolean = config?.hasBackdrop;
		const minWidth: string = config?.minWidth;
		const minHeight: string = config?.minHeight;
		const positionStrategy: PositionStrategy = this._overlay
		.position()
		.global()
		.centerHorizontally()
		.centerVertically();
		const overlayConfig: OverlayConfig = new OverlayConfig({
			positionStrategy,
			hasBackdrop		: hasBackdrop !== undefined ? hasBackdrop : true,
			backdropClass	: [ 'wgc-dialog-backdrop', config?.backdropClass ],
			panelClass		: [ 'wgc-dialog-panel', config?.panelClass ],
			width			: config?.width,
			minWidth		: parseFloat( minWidth ) < window.innerWidth ? minWidth : undefined,
			maxWidth		: config?.maxWidth,
			height			: config?.height,
			minHeight		: parseFloat( minHeight ) < window.innerHeight ? minHeight : undefined,
			maxHeight		: config?.maxHeight,
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

			const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

			if ( dialogRef.isFullscreen ) {
				this.exitFullscreen( overlayRef );
				return;
			}

			config.autoClose && this._autoClose( overlayRef );
		} );

		// On outside pointer events
		overlayRef
		.outsidePointerEvents()
		.pipe( takeUntil( overlayRef.detachments() ) )
		.subscribe( () => {
			config.autoClose && this._autoClose( overlayRef );
		} );

		// On attach
		overlayRef
		.attachments()
		.pipe( delay( 0 ), take( 1 ) )
		.subscribe( () => this._getDialogRef( overlayRef ).afterOpened().complete() );

		// On detach
		overlayRef
		.detachments()
		.pipe( delay( 0 ), take( 1 ) )
		.subscribe( () => {
			const dialogRef: WGCIDialogRef = this._getDialogRef( overlayRef );

			dialogRef.isFreezing
				= dialogRef.isFullscreen
				= dialogRef.container.isFreezing
				= dialogRef.container.isFullscreen
				= dialogRef.container.isPreviousPagerDisplayed
				= dialogRef.container.isPreviousPagerDisabled
				= dialogRef.container.isNextPagerDisplayed
				= dialogRef.container.isNextPagerDisabled
				= false;

			dialogRef.afterClosed().complete();
			dialogRef.afterFreezed().complete();
			dialogRef.afterUnfreezed().complete();
			dialogRef.afterFullscreen().complete();
			dialogRef.afterExitFullscreen().complete();
			dialogRef.afterPagerClicked().complete();
		} );

		return this._overlayRef = overlayRef;
	}

	/**
	 * @param {any} component
	 * @param {WGCIDialogConfig=} config
	 * @return {WGCIDialogRef}
	 */
	private _createDialog( component: any, config?: WGCIDialogConfig ): WGCIDialogRef {
		const overlayRef: OverlayRef = this._createOverlay( config );
		const containerPortal: ComponentPortal<WGCDialogContainerComponent> = new ComponentPortal( WGCDialogContainerComponent, config.viewContainerRef );
		const instance: WGCDialogContainerComponent = overlayRef.attach( containerPortal ).instance;
		const closeFn: typeof this.close = ( data?: any ) => this.close( data, overlayRef );
		const freezeFn: typeof this.freeze = () => this.freeze( overlayRef );
		const unfreezeFn: typeof this.unfreeze = () => this.unfreeze( overlayRef );
		const fullscreenFn: typeof this.fullscreen = () => this.fullscreen( overlayRef );
		const exitFullscreenFn: typeof this.exitFullscreen = () => this.exitFullscreen( overlayRef );
		const pagerClickFn: typeof this.pagerClick = ( type: WGCIDialogPagerType ) => this.pagerClick( type, overlayRef );
		const opened$: ReplaySubject<ComponentType<any>> = new ReplaySubject<ComponentType<any>>();
		const closed$: ReplaySubject<any> = new ReplaySubject<any>();
		const freezed$: ReplaySubject<void> = new ReplaySubject<void>();
		const unfreezed$: ReplaySubject<void> = new ReplaySubject<void>();
		const fullscreen$: ReplaySubject<void> = new ReplaySubject<void>();
		const exitFullscreen$: ReplaySubject<void> = new ReplaySubject<void>();
		const pagerClicked$: ReplaySubject<WGCIDialogPagerType> = new ReplaySubject<WGCIDialogPagerType>();
		const pagerEnabled$: ReplaySubject<WGCIDialogPagerType> = new ReplaySubject<WGCIDialogPagerType>();
		const pagerDisabled$: ReplaySubject<WGCIDialogPagerType> = new ReplaySubject<WGCIDialogPagerType>();
		const pagerShowed$: ReplaySubject<WGCIDialogPagerType> = new ReplaySubject<WGCIDialogPagerType>();
		const pagerHidden$: ReplaySubject<WGCIDialogPagerType> = new ReplaySubject<WGCIDialogPagerType>();
		const dialogRef: WGCIDialogRef = {
			config,
			container			: instance,
			isFreezing			: false,
			isFullscreen		: false,
			close				: closeFn,
			freeze				: freezeFn,
			unfreeze			: unfreezeFn,
			fullscreen			: fullscreenFn,
			exitFullscreen		: exitFullscreenFn,
			pagerClick			: pagerClickFn,
			enablePager			: ( type: WGCIDialogPagerType ) => this.enablePager( type, overlayRef ),
			disablePager		: ( type: WGCIDialogPagerType ) => this.disablePager( type, overlayRef ),
			showPager			: ( type: WGCIDialogPagerType ) => this.showPager( type, overlayRef ),
			hidePager			: ( type: WGCIDialogPagerType ) => this.hidePager( type, overlayRef ),
			afterOpened			: (): ReplaySubject<ComponentType<any>> => opened$,
			afterClosed			: (): ReplaySubject<any> => closed$,
			afterFreezed		: (): ReplaySubject<void> => freezed$,
			afterUnfreezed		: (): ReplaySubject<void> => unfreezed$,
			afterFullscreen		: (): ReplaySubject<void> => fullscreen$,
			afterExitFullscreen	: (): ReplaySubject<void> => exitFullscreen$,
			afterPagerClicked	: (): ReplaySubject<WGCIDialogPagerType> => pagerClicked$,
			afterPagerEnabled	: (): ReplaySubject<WGCIDialogPagerType> => pagerEnabled$,
			afterPagerDisabled	: (): ReplaySubject<WGCIDialogPagerType> => pagerDisabled$,
			afterPagerShowed	: (): ReplaySubject<WGCIDialogPagerType> => pagerShowed$,
			afterPagerHidden	: (): ReplaySubject<WGCIDialogPagerType> => pagerHidden$,
		} as WGCIDialogRef;

		if ( _.isFunction( component ) ) {
			instance.attachComponentPortal(
				new ComponentPortal(
					component as any,
					instance.viewContainerRef,
					Injector.create({
						parent: this._injector,
						providers: [
							{ provide: WGC_DIALOG_DATA, useValue: config.data },
							{ provide: WGC_DIALOG_REF, useValue: dialogRef },
						],
					})
				)
			);
		} else {
			instance.attachTemplatePortal(
				new TemplatePortal(
					component,
					instance.viewContainerRef,
					{ data: config.data, dialogRef }
				)
			);
		}

		// Bind instance's attributes
		instance.isPreviousPagerDisplayed = instance.isNextPagerDisplayed = config.pager;
		instance.isFreezing = dialogRef.isFreezing;
		instance.isFullscreen = dialogRef.isFullscreen;

		// Bind instance's methods
		instance.close = closeFn;
		instance.freeze = freezeFn;
		instance.unfreeze = unfreezeFn;
		instance.fullscreen = fullscreenFn;
		instance.exitFullscreen = exitFullscreenFn;
		instance.pagerClick = pagerClickFn;

		// Set fullscreen after opened
		setTimeout( () => config.fullscreen && fullscreenFn() );

		return this._dialogRef = ( overlayRef as any )._dialogRef = dialogRef;
	}

	/**
	 * @param {OverlayRef=} overlayRef
	 * @return {WGCIDialogRef}
	 */
	private _getDialogRef( overlayRef: OverlayRef = this._overlayRef ): WGCIDialogRef {
		if ( !overlayRef ) return;

		return ( overlayRef as any )._dialogRef || this._dialogRef;
	}

}
