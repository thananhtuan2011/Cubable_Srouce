import {
	Injectable,
	inject,
	Injector
} from '@angular/core';
import {
	GlobalPositionStrategy,
	OverlayConfig,
	Overlay
} from '@angular/cdk/overlay';
import {
	ComponentPortal
} from '@angular/cdk/portal';
import {
	take
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';

import {
	CUBOverlay2Service,
	CUBOverlayRef
} from '../../overlay2';

import {
	CUBToastGroupComponent
} from '../toast-group/toast-group.component';

import {
	CUBToastConfig,
	CUBToastPosition,
	CUBToastType,
	CUBToastTitleType
} from './toast.component';

@Injectable({ providedIn: 'any' })
export class CUBToastService {

	private readonly _overlayService: CUBOverlay2Service
		= inject( CUBOverlay2Service );
	private readonly _injector: Injector
		= inject( Injector );
	private readonly _overlay: Overlay
		= inject( Overlay );

	private _overlayRef: CUBOverlayRef;
	private _portal: ComponentPortal<CUBToastGroupComponent>;
	private _instance: CUBToastGroupComponent;
	private _defaultConfig: CUBToastConfig = {
		position: CUBToastPosition.Bottom,
		canClose: true,
		translate: true,
		duration: 5000,
	};

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public show(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		config = {
			...this._defaultConfig,
			...config,
		};

		if ( !this._instance ) {
			const positionStrategy: GlobalPositionStrategy
				= this._overlay
				.position()
				.global()
				.centerHorizontally();

			const overlayConfig: OverlayConfig = {
				positionStrategy,
				scrollStrategy: this._overlay
				.scrollStrategies
				.reposition({
					autoClose: true,
					scrollThrottle: 1000,
				}),
				panelClass: [],
			};

			switch ( config.position ) {
				case CUBToastPosition.Bottom:
				case CUBToastPosition.Top:
					positionStrategy[ config.position ]( '0px' );
					break;
				case CUBToastPosition.TopLeft:
					positionStrategy
					.left( '0px' )
					.top( '0px' );
					break;
				case CUBToastPosition.TopRight:
					positionStrategy
					.right( '0px' )
					.top( '0px' );
					break;
				case CUBToastPosition.BottomLeft:
					positionStrategy
					.left( '0px' )
					.bottom( '0px' );
					break;
				case CUBToastPosition.BottomRight:
					positionStrategy
					.right( '0px' )
					.bottom( '0px' );
					break;
			}

			overlayConfig.positionStrategy
				= positionStrategy;

			const overlayRef: CUBOverlayRef
				= this._overlayService.create(
					overlayConfig
				);

			overlayRef
			.onDetached()
			.pipe( take( 1 ) )
			.subscribe({
				next: () => {
					this._instance = undefined;
				},
			});

			this._overlayRef
				= overlayRef;

			this._instance
				= this._overlayRef
				.attach(
					this._portal
						||= this._createPortal()
				);

			this._instance.onDeletedAll
				= () => this._overlayRef.dispose();
		}

		return this._instance
		.createToast( title, config );
	}

	/**
	 * @param {ULID} id
	 * @return {void}
	 */
	public close( id: ULID ) {
		this._instance?.deleteToast( id );
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		this._overlayRef?.dispose();
	}

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public info(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		return this.show(
			title,
			{
				...config,
				type: CUBToastType.Info,
			}
		);
	}

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public success(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		return this.show(
			title,
			{
				...config,
				type: CUBToastType.Success,
			}
		);
	}

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public warning(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		return this.show(
			title,
			{
				...config,
				type: CUBToastType.Warning,
			}
		);
	}

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public danger(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		return this.show(
			title,
			{
				...config,
				type: CUBToastType.Danger,
			}
		);
	}

	/**
	 * @return {ComponentPortal<CUBToastGroupComponent>}
	 */
	private _createPortal(): ComponentPortal<CUBToastGroupComponent> {
		return new ComponentPortal(
			CUBToastGroupComponent,
			undefined,
			this._injector
		);
	}

}
