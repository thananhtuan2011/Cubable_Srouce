import {
	ElementRef,
	inject,
	Injectable,
	Injector,
	ViewContainerRef
} from '@angular/core';
import {
	coerceElement
} from '@angular/cdk/coercion';
import {
	OverlayRef,
	PositionStrategy
} from '@angular/cdk/overlay';
import {
	ComponentPortal,
	Portal,
	TemplatePortal
} from '@angular/cdk/portal';
import {
	EMPTY,
	fromEvent,
	isObservable,
	Observable,
	of,
	ReplaySubject,
	Subject
} from 'rxjs';
import {
	take,
	takeUntil
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CUBOverlayCallbacks,
	CUBOverlayConfig,
	CUBOverlayService,
	CUBOverlaySizeConfig
} from '../../overlay';

import {
	CUBPopupComponent
} from '../popup/popup.component';

export type CUBPopupPositionStrategy
	= PositionStrategy;
export type CUBPopupSizeConfig
	= CUBOverlaySizeConfig;
export type CUBPopupConfig
	= CUBOverlayConfig & {
		disableClose?: boolean;
		viewContainerRef?:
			ViewContainerRef;
	};

export interface CUBIPopupInstance {
	onBeforeClose?():
		boolean | Observable<boolean>;
	onClosed?(): any;
}

export type CUBPopupInstance
	= CUBIPopupInstance;

export type CUBPopupRef<T = CUBPopupInstance> = {
	isOpened: boolean;
	isCloseDisabled: boolean;
	origin: ElementRef;
	config: CUBPopupConfig;
	overlayRef: OverlayRef;
	instance: T;
	close(): void;
	enableClose(): void;
	disableClose(): void;
	updateConfig(
		config: CUBPopupConfig
	): void;
	updatePosition(
		positionStrategy?: CUBPopupPositionStrategy
	): void;
	updateSize(
		sizeConfig: CUBPopupSizeConfig
	): void;
	afterOpened(): ReplaySubject<void>;
	afterClosed(): ReplaySubject<any>;
};

export const CUB_POPUP_REF: string
	= 'CUB_POPUP_REF';
export const CUB_POPUP_CONTEXT: string
	= 'CUB_POPUP_CONTEXT';

let refs: CUBPopupRef[] = [];

@Injectable({
	providedIn: 'any',
})
export class CUBPopupService
	extends CUBOverlayService {

	private readonly _injector: Injector
		= inject( Injector );

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {any} component
	 * @param {ObjectType=} context
	 * @param {CUBPopupConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @param {string=} eventName
	 * @return {Subject}
	 */
	public bind(
		origin: ElementRef | HTMLElement,
		component: any,
		context?: ObjectType,
		config?: CUBPopupConfig,
		callbacks?: CUBOverlayCallbacks,
		eventName: string = 'click'
	): Subject<CUBPopupRef> {
		if ( !origin ) return;

		const el: HTMLElement
			= coerceElement( origin );
		const opened$: Subject<CUBPopupRef>
			= new Subject<CUBPopupRef>();
		let popupRef: CUBPopupRef;

		fromEvent(
			el,
			eventName
		)
		.pipe(
			takeUntil(
				config?.destroyed$
					|| EMPTY
			)
		)
		.subscribe({
			next: () => {
				if ( popupRef?.isOpened ) {
					return;
				}

				opened$.next(
					popupRef = this.open(
						origin,
						component,
						context,
						config,
						callbacks
					)
				);
			},
			complete: () => {
				opened$.complete();
			},
		});

		return opened$;
	}

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {any} component
	 * @param {ObjectType=} context
	 * @param {CUBPopupConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {CUBPopupRef}
	 */
	public open<T = CUBPopupInstance>(
		origin: ElementRef | HTMLElement,
		component: any,
		context?: ObjectType,
		config?: CUBPopupConfig,
		callbacks?: CUBOverlayCallbacks
	): CUBPopupRef<T> {
		origin = origin
			instanceof HTMLElement
			? new ElementRef( origin )
			: origin;

		component.context
			= context;

		config = {
			origin,

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

				popupRef.isOpened = true;

				if ( component
						instanceof CUBPopupComponent ) {
					component.markAsOpened();
				}

				opened$.next();
				opened$.complete();
			},
			onDetached: (
				oRef: OverlayRef
			) => {
				onDetached?.( oRef );

				popupRef.isOpened = false;

				if ( component
						instanceof CUBPopupComponent ) {
					component.markAsClosed();
				}

				closed$.next(
					(
						popupRef
						.instance as CUBPopupInstance
					)?.onClosed?.()
				);

				opened$.complete();
				closed$.complete();
			},
			onKeydown: (
				e: KeyboardEvent,
				oRef: OverlayRef
			) => {
				onKeydown?.( e, oRef );

				if ( popupRef.isCloseDisabled ) {
					return;
				}

				switch ( e.key ) {
					case 'Escape':
						e.stopPropagation();
						e.preventDefault();

						popupRef.close();
						break;
				}
			},
			onOutsideClicked: (
				e: MouseEvent,
				oRef: OverlayRef
			) => {
				onOutsideClicked?.(
					e,
					oRef
				);

				if ( popupRef.isCloseDisabled ) {
					return;
				}

				popupRef.close();
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
		const popupRef: CUBPopupRef<T>
			= component.ref
			= {
				isOpened: false,
				isCloseDisabled:
					config.disableClose,
				origin,
				config,
				overlayRef,
				close: () =>
					this.close( popupRef ),
				enableClose: () =>
					this.enableClose( popupRef ),
				disableClose: () =>
					this.disableClose( popupRef ),
				updateConfig: (
					_config?: CUBPopupConfig
				) => this.updateConfig(
					popupRef,
					_config
				),
				updatePosition: (
					positionStrategy?:
						CUBPopupPositionStrategy
				) => this.updatePosition(
					popupRef,
					positionStrategy
				),
				updateSize: (
					sizeConfig?:
						CUBPopupSizeConfig
				) => this.updateSize(
					popupRef,
					sizeConfig
				),
				afterOpened: () => opened$,
				afterClosed: () => closed$,
			} as CUBPopupRef<T>;

		popupRef.instance
			= overlayRef
			.attach(
				this._createPortal(
					component,
					popupRef,
					context,
					config.viewContainerRef
				)
			)
			.instance as T;

		refs.push( popupRef );

		return popupRef;
	}

	/**
	 * @param {CUBPopupRef} popupRef
	 * @return {void}
	 */
	public close(
		popupRef: CUBPopupRef
	) {
		const canClose$: ReturnType<
			CUBPopupInstance[ 'onBeforeClose' ]
		> = popupRef
		.instance
		?.onBeforeClose?.();

		(
			isObservable( canClose$ )
				? canClose$
				: of( canClose$ )
		)
		.pipe(
			take( 1 )
		)
		.subscribe(
			( canClose: boolean ) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
				if ( canClose === false ) {
					return;
				}

				popupRef
				.overlayRef
				.dispose();
			}
		);
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		_.forEach(
			refs,
			( ref: CUBPopupRef ) => {
				ref.close();
			}
		);

		refs = [];
	}

	/**
	 * @param {CUBPopupRef} popupRef
	 * @return {void}
	 */
	public enableClose(
		popupRef: CUBPopupRef
	) {
		popupRef
		.isCloseDisabled = false;
	}

	/**
	 * @param {CUBPopupRef} popupRef
	 * @return {void}
	 */
	public disableClose(
		popupRef: CUBPopupRef
	) {
		popupRef
		.isCloseDisabled = true;
	}

	/**
	 * @param {CUBPopupRef} popupRef
	 * @param {CUBPopupConfig} config
	 * @return {void}
	 */
	public updateConfig(
		popupRef: CUBPopupRef,
		config: CUBPopupConfig
	) {
		popupRef.config = {
			...popupRef.config,
			...config,
		};

		popupRef.isCloseDisabled
			||= popupRef
			.config
			.disableClose;

		popupRef.updatePosition(
			this.createPositionStrategy(
				popupRef.config
			)
		);
		popupRef.updateSize(
			popupRef.config
		);
	}

	/**
	 * @param {CUBPopupRef | any} popupRef
	 * @param {CUBPopupPositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public override updatePosition(
		popupRef:
			CUBPopupRef | any,
		positionStrategy?:
			CUBPopupPositionStrategy
	) {
		super.updatePosition(
			popupRef.overlayRef,
			positionStrategy
		);
	}

	/**
	 * @param {CUBPopupRef | any} popupRef
	 * @param {CUBPopupSizeConfig=} sizeConfig
	 * @return {void}
	 */
	public override updateSize(
		popupRef:
			CUBPopupRef | any,
		sizeConfig?:
			CUBPopupSizeConfig
	) {
		super.updateSize(
			popupRef.overlayRef,
			sizeConfig
		);
	}

	/**
	 * @param {any} component
	 * @param {CUBPopupRef} popupRef
	 * @param {ObjectType} context
	 * @param {ViewContainerRef=} vcRef
	 * @return {Portal}
	 */
	private _createPortal(
		component: any,
		popupRef: CUBPopupRef,
		context: ObjectType,
		vcRef?: ViewContainerRef
	): Portal<any> {
		let portal: Portal<any>;

		if (
			component
				instanceof Portal
		) {
			portal = component;
		} else if (
			component
				instanceof CUBPopupComponent
		) {
			portal = new TemplatePortal(
				component.templateRef,
				vcRef
			);
		} else {
			portal = new ComponentPortal(
				component,
				vcRef
			);
		}

		if (
			portal
				instanceof ComponentPortal
		) {
			portal.injector
				= Injector.create({
					parent: this._injector,
					providers: [
						{
							provide:
								CUB_POPUP_REF,
							useValue:
								popupRef,
						},
						{
							provide:
								CUB_POPUP_CONTEXT,
							useValue:
								context,
						},
					],
				});
		} else if (
			portal
				instanceof TemplatePortal
		) {
			portal.context = context;
		}

		return portal;
	}

}
