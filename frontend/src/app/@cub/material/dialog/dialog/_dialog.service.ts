import {
	inject,
	Injectable,
	Injector,
	ViewContainerRef
} from '@angular/core';
import {
	coerceArray
} from '@angular/cdk/coercion';
import {
	Overlay,
	OverlayRef
} from '@angular/cdk/overlay';
import {
	ComponentPortal,
	TemplatePortal
} from '@angular/cdk/portal';
import {
	NavigationStart,
	Router
} from '@angular/router';
import {
	isObservable,
	Observable,
	of,
	ReplaySubject
} from 'rxjs';
import {
	filter,
	map,
	pairwise,
	take
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CUBOverlayCallbacks,
	CUBOverlayConfig,
	CUBOverlayService,
	CUBOverlaySizeConfig
} from '../../overlay';

import {
	CUBDialogContainerComponent
} from '../dialog-container/_dialog-container.component';

export type CUBDialogSizeConfig
	= CUBOverlaySizeConfig;
export type CUBDialogConfig
	= Omit<
		CUBOverlayConfig,
		'positionStrategy'
	> & {
		disableClose?: boolean;
		resizable?: boolean;
		viewContainerRef?: ViewContainerRef;
	};

export interface CUBIDialogInstance {
	onBeforeClose?():
		boolean | Observable<boolean>;
	onClosed?(): any;
}

export type CUBDialogInstance
	= CUBIDialogInstance;

export type CUBDialogRef<T = CUBDialogInstance> = {
	isOpened: boolean;
	isCloseDisabled: boolean;
	config: CUBDialogConfig;
	overlayRef: OverlayRef;
	container: CUBDialogContainerComponent;
	instance: T;
	close(): void;
	enableClose(): void;
	disableClose(): void;
	updateConfig(
		config:
			Partial<CUBDialogConfig>
	): void;
	updateSize(
		sizeConfig:
			CUBDialogSizeConfig
	): void;
	afterOpened(): ReplaySubject<void>;
	afterClosed(): ReplaySubject<any>;
	afterResized(): ReplaySubject<number>;
};

export const CUB_DIALOG_CONTEXT: string
	= 'CUB_DIALOG_CONTEXT';
export const CUB_DIALOG_REF: string
	= 'CUB_DIALOG_REF';

let refs: CUBDialogRef[] = [];

@Injectable({
	providedIn: 'any',
})
export class CUBDialogService
	extends CUBOverlayService {

	private readonly _injector: Injector
		= inject( Injector );
	private readonly _overlay: Overlay
		= inject( Overlay );
	private readonly _router: Router
		= inject( Router );

	/**
	 * @constructor
	 */
	constructor() {
		super();

		this
		._router
		.events
		.pipe(
			filter(
				( e: NavigationStart ): boolean =>
					e instanceof NavigationStart
			),
			map(
				( e: NavigationStart ): string =>
					e.url.split( '?' )[ 0 ]
			),
			pairwise(),
			filter(
				(
					[ prev, curr ]: string[]
				): boolean => prev !== curr
			)
		)
		.subscribe(() => {
			this.closeAll();
		});
	}

	/**
	 * @param {ComponentType} component
	 * @param {ObjectType=} context
	 * @param {CUBDialogConfig=} config
	 * @return {CUBDialogRef}
	 */
	public open<T = CUBDialogInstance>(
		component: any,
		context?: ObjectType,
		config?: CUBDialogConfig
	): CUBDialogRef<T> {
		return this._createDialog<T>(
			component,
			context,
			config
		);
	}

	/**
	 * @param {CUBDialogRef} dialogRef
	 * @return {void}
	 */
	public close(
		dialogRef: CUBDialogRef
	) {
		let canClose$: boolean | Observable<boolean>
			= dialogRef
			.instance
			?.onBeforeClose?.();

		canClose$ = isObservable( canClose$ )
			? canClose$
			: of( canClose$ );

		canClose$
		.pipe(
			take( 1 )
		)
		.subscribe((
			canClose: boolean
		) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
			if ( canClose === false ) {
				return;
			}

			const { overlayRef }: CUBDialogRef
				= dialogRef;

			this._addSlideAnimation(
				overlayRef,
				() => {
					overlayRef.removePanelClass(
						'cub-dialog-pane--opened'
					);

					overlayRef.dispose();
				}
			);
		});
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		_.forEach(
			refs,
			( ref: CUBDialogRef ) => {
				ref.close();
			}
		);

		refs = [];
	}

	/**
	 * @param {CUBDialogRef} dialogRef
	 * @return {void}
	 */
	public enableClose(
		dialogRef: CUBDialogRef
	) {
		dialogRef.isCloseDisabled = false;
	}

	/**
	 * @param {CUBDialogRef} dialogRef
	 * @return {void}
	 */
	public disableClose(
		dialogRef: CUBDialogRef
	) {
		dialogRef.isCloseDisabled = true;
	}

	/**
	 * @param {CUBDialogRef} dialogRef
	 * @param {CUBDialogConfig} config
	 * @return {void}
	 */
	public updateConfig(
		dialogRef: CUBDialogRef,
		config: CUBDialogConfig
	) {
		dialogRef.config = {
			...dialogRef.config,
			...config,
		};

		dialogRef.isCloseDisabled
			||= dialogRef
			.config
			.disableClose;

		dialogRef.updateSize(
			dialogRef.config
		);
	}

	/**
	 * @return {void}
	 */
	public override updatePosition() {}

	/**
	 * @param {CUBDialogRef | any} dialogRef
	 * @param {CUBDialogSizeConfig=} sizeConfig
	 * @return {void}
	 */
	public override updateSize(
		dialogRef:
			CUBDialogRef | any,
		sizeConfig?:
			CUBDialogSizeConfig
	) {
		super.updateSize(
			dialogRef.overlayRef,
			sizeConfig
		);
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @return {CUBOverlayConfig}
	 */
	public override createConfig(
		config: CUBOverlayConfig
	): CUBOverlayConfig {
		const panelClass: string[] = [
			'cub-dialog-pane',

			...coerceArray( config.panelClass ),
		];

		config = super.createConfig( config );

		config.panelClass = panelClass;

		return config;
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {OverlayRef}
	 */
	public override createOverlay(
		config: CUBOverlayConfig,
		callbacks?: CUBOverlayCallbacks
	): OverlayRef {
		const width: number
			= parseFloat( config.width as string );
		const minWidth: number
			= parseFloat( config.minWidth as string );
		const windowWidth: number
			= window.innerWidth;

		config = {
			...config,

			width:
				width < windowWidth
					? config.width
					: undefined,
			minWidth:
				minWidth < windowWidth
					? config.minWidth
					: undefined,
			positionStrategy:
				this
				._overlay
				.position()
				.global()
				.right( '0px' ),
		};

		return super.createOverlay(
			config,
			callbacks
		);
	}

	/**
	 * @param {any} component
	 * @param {ObjectType=} context
	 * @param {CUBDialogConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {CUBDialogRef}
	 */
	private _createDialog<T = CUBDialogInstance>(
		component: any,
		context?: ObjectType,
		config?: CUBDialogConfig,
		callbacks?: CUBOverlayCallbacks
	): CUBDialogRef<T> {
		config = {
			resizable: true,

			...this.createConfig( config ),
		};

		const {
			onAttached,
			onDetached,
			onKeydown,
			onOutsideClicked,
		}: CUBOverlayCallbacks
			= callbacks || {};

		callbacks = {
			...callbacks,

			onAttached: (
				oRef: OverlayRef
			) => {
				onAttached?.( oRef );

				this._addSlideAnimation(
					oRef,
					() => {
						oRef.addPanelClass(
							'cub-dialog-pane--opened'
						);
					}
				);

				dialogRef.isOpened = true;

				opened$.next();
				opened$.complete();
			},
			onDetached: (
				oRef: OverlayRef
			) => {
				onDetached?.( oRef );

				dialogRef.isOpened = false;

				closed$.next(
					(
						dialogRef.instance as
							CUBDialogInstance
					)?.onClosed?.()
				);

				opened$.complete();
				closed$.complete();
				resized$.complete();
			},
			onKeydown: (
				e: KeyboardEvent,
				oRef: OverlayRef
			) => {
				onKeydown?.( e, oRef );

				if ( dialogRef.isCloseDisabled ) {
					return;
				}

				switch ( e.key ) {
					case 'Escape':
						e.stopPropagation();
						e.preventDefault();

						dialogRef.close();
						break;
				}
			},
			onOutsideClicked: (
				e: MouseEvent,
				oRef: OverlayRef
			) => {
				onOutsideClicked?.( e, oRef );

				if ( dialogRef.isCloseDisabled ) {
					return;
				}

				dialogRef.close();
			},
		};

		const overlayRef: OverlayRef
			= this.createOverlay(
				config,
				callbacks
			);
		const opened$: ReplaySubject<void>
			= new ReplaySubject<void>();
		const closed$: ReplaySubject<any>
			= new ReplaySubject<any>();
		const resized$: ReplaySubject<number>
			= new ReplaySubject<number>();
		const dialogRef: CUBDialogRef<T>
			= {
				isCloseDisabled:
					config.disableClose,
				config,
				overlayRef,
				close: () =>
					this.close( dialogRef ),
				enableClose: () =>
					this.enableClose( dialogRef ),
				disableClose: () =>
					this.disableClose( dialogRef ),
				updateConfig: (
					_config: CUBDialogConfig
				) => this.updateConfig(
					dialogRef,
					_config
				),
				updateSize: (
					sizeConfig:
						CUBDialogSizeConfig
				) => this.updateSize(
					dialogRef,
					sizeConfig
				),
				afterOpened: () => opened$,
				afterClosed: () => closed$,
				afterResized: () => resized$,
			} as CUBDialogRef<T>;
		const container: CUBDialogContainerComponent
			= dialogRef.container
			= overlayRef.attach(
				new ComponentPortal(
					CUBDialogContainerComponent,
					config.viewContainerRef
				)
			).instance as CUBDialogContainerComponent;

		dialogRef.container.ref = dialogRef;

		if ( _.isFunction( component ) ) {
			dialogRef.instance
				= container.attachComponentPortal(
					new ComponentPortal(
						component as any,
						container.viewContainerRef,
						Injector.create({
							parent: this._injector,
							providers: [
								{
									provide:
										CUB_DIALOG_CONTEXT,
									useValue:
										context,
								},
								{
									provide:
										CUB_DIALOG_REF,
									useValue:
										dialogRef,
								},
							],
						})
					)
				).instance;
		} else {
			container.attachTemplatePortal(
				new TemplatePortal(
					component,
					container.viewContainerRef,
					{
						dialogRef,
						context,
					}
				)
			);
		}

		refs.push( dialogRef );

		return dialogRef;
	}

	/**
	 * @param {OverlayRef} overlayRef
	 * @param {Function} callback
	 */
	private _addSlideAnimation(
		overlayRef: OverlayRef,
		callback: () => void
	) {
		overlayRef.addPanelClass(
			'cub-dialog-pane--sliding'
		);

		setTimeout(
			() => {
				overlayRef.removePanelClass(
					'cub-dialog-pane--sliding'
				);

				callback();
			},
			225
		);
	}

}
