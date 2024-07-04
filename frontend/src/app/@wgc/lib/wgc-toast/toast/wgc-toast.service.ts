import { Injectable } from '@angular/core';
import { OverlayRef, Overlay, PositionStrategy, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { take } from 'rxjs/operators';
import _ from 'lodash';

import { Memoize } from '@core';

import { WGCToastGroupComponent } from '../toast-group/wgc-toast-group.component';

import { WGCIToastConfig, WGCIToastPosition } from './wgc-toast.component';

@Injectable()
export class WGCToastService {

	private _topOverlayRef: OverlayRef;
	private _bottomOverlayRef: OverlayRef;
	private _topPortal: ComponentPortal<WGCToastGroupComponent>;
	private _bottomPortal: ComponentPortal<WGCToastGroupComponent>;
	private _topInstance: WGCToastGroupComponent;
	private _bottomInstance: WGCToastGroupComponent;
	private _defaultConfig: WGCIToastConfig = {
		position	: 'bottom',
		canClose	: true,
		translate	: true,
		duration	: 5000,
	};

	/**
	 * @constructor
	 * @param {Overlay} _overlay
	 */
	constructor( private _overlay: Overlay ) {}

	/**
	 * @param {string} title
	 * @param {any} arg
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public show( title: string, arg?: any, config?: WGCIToastConfig ): number {
		const description: string = !_.isObject( arg ) ? arg as string : undefined;

		config = _.isObject( arg ) ? arg as WGCIToastConfig : config;
		config = { ...this._defaultConfig, ...config };

		return config?.position === 'top'
			? this._showOnTop( title, description, config )
			: this._showOnBottom( title, description, config );
	}

	/**
	 * @param {number} id
	 * @return {void}
	 */
	public close( id: number ) {
		this._topInstance?.deleteToast( id );
		this._bottomInstance?.deleteToast( id );
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		this._topOverlayRef?.dispose();
		this._bottomOverlayRef?.dispose();
	}

	/**
	 * @param {string} title
	 * @param {any} arg
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public info( title: string, arg?: any, config?: WGCIToastConfig ): number {
		const description: string = !_.isObject( arg ) ? arg as string : undefined;

		config = _.isObject( arg ) ? arg as WGCIToastConfig : config;

		return this.show( title, description, { ...config, type: 'info' } );
	}

	/**
	 * @param {string} title
	 * @param {any} arg
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public success( title: string, arg?: any, config?: WGCIToastConfig ): number {
		const description: string = !_.isObject( arg ) ? arg as string : undefined;

		config = _.isObject( arg ) ? arg as WGCIToastConfig : config;

		return this.show( title, description, { ...config, type: 'success' } );
	}

	/**
	 * @param {string} title
	 * @param {any} arg
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public warning( title: string, arg?: any, config?: WGCIToastConfig ): number {
		const description: string = !_.isObject( arg ) ? arg as string : undefined;

		config = _.isObject( arg ) ? arg as WGCIToastConfig : config;

		return this.show( title, description, { ...config, type: 'warning' } );
	}

	/**
	 * @param {string} title
	 * @param {any} arg
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public danger( title: string, arg?: any, config?: WGCIToastConfig ): number {
		const description: string = !_.isObject( arg ) ? arg as string : undefined;

		config = _.isObject( arg ) ? arg as WGCIToastConfig : config;

		return this.show( title, description, { ...config, type: 'danger' } );
	}

	/**
	 * @param {string} title
	 * @param {string=} description
	 * @param {WGCIToastConfig=} config
	 * @return {number}
	 */
	private _showOnTop( title: string, description?: string, config?: WGCIToastConfig ): number {
		if ( !this._topInstance ) {
			// Create toast group instance
			this._topInstance = this._createTopOverlay().attach( this._createTopPortal() ).instance;

			// Bind instance's methods
			this._topInstance.onDeletedAll = () => this._topOverlayRef.dispose();
		}

		// Create toast
		return this._topInstance.createToast( title, description, config );
	}

	/**
	 * @param {string} title
	 * @param {string=} description
	 * @param {WGCIToastConfig=} config
	 * @return {number}
	 */
	private _showOnBottom( title: string, description?: string, config?: WGCIToastConfig ): number {
		if ( !this._bottomInstance ) {
			// Create toast group instance
			this._bottomInstance = this._createBottomOverlay().attach( this._createBottomPortal() ).instance;

			// Bind instance's methods
			this._bottomInstance.onDeletedAll = () => this._bottomOverlayRef.dispose();
		}

		// Create toast
		return this._bottomInstance.createToast( title, description, config );
	}

	/**
	 * @return {OverlayRef}
	 */
	private _createTopOverlay(): OverlayRef {
		const overlayRef: OverlayRef = this._createOverlay( 'top' );

		// On detach
		overlayRef
		.detachments()
		.pipe( take( 1 ) )
		.subscribe( () => this._topInstance = undefined );

		return this._topOverlayRef = overlayRef;
	}

	/**
	 * @return {OverlayRef}
	 */
	private _createBottomOverlay(): OverlayRef {
		const overlayRef: OverlayRef = this._createOverlay( 'bottom' );

		// On detach
		overlayRef
		.detachments()
		.pipe( take( 1 ) )
		.subscribe( () => this._bottomInstance = undefined );

		return this._bottomOverlayRef = overlayRef;
	}

	/**
	 * @param {WGCIToastPosition} position
	 * @return {OverlayRef}
	 */
	private _createOverlay( position: WGCIToastPosition ): OverlayRef {
		const positionStrategy: PositionStrategy = this._overlay.position().global().centerHorizontally();

		positionStrategy[ position ]( 0 );

		return this._overlay.create( new OverlayConfig({ positionStrategy }) );
	}

	/**
	 * @return {ComponentPortal<WGCToastGroupComponent>}
	 */
	private _createTopPortal(): ComponentPortal<WGCToastGroupComponent> {
		return this._topPortal ||= this._createPortal();
	}

	/**
	 * @return {ComponentPortal<WGCToastGroupComponent>}
	 */
	private _createBottomPortal(): ComponentPortal<WGCToastGroupComponent> {
		return this._bottomPortal ||= this._createPortal();
	}

	/**
	 * @return {ComponentPortal<WGCToastGroupComponent>}
	 */
	@Memoize()
	private _createPortal(): ComponentPortal<WGCToastGroupComponent> {
		return new ComponentPortal( WGCToastGroupComponent );
	}

}
