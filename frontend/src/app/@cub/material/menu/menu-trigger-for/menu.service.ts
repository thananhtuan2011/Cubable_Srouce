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
	GlobalPositionStrategy,
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
	CUBOverlayPosition,
	CUBOverlayService,
	CUBOverlaySizeConfig
} from '../../overlay';

import {
	CUBMenuComponent
} from '../menu/menu.component';

export enum CUBMenuType {
	Default = 'default',
	ContextMenu = 'context-menu',
	FitMenu = 'fit-menu',
}

export type CUBMenuPositionStrategy
	= PositionStrategy;
export type CUBMenuSizeConfig
	= CUBOverlaySizeConfig;
export type CUBMenuConfig
	= CUBOverlayConfig & {
		type?: CUBMenuType;
		disableClose?: boolean;
		viewContainerRef?: ViewContainerRef;
	};

export interface CUBIMenuInstance {
	onBeforeClose?():
		boolean | Observable<boolean>;
	onClosed?(): any;
}

export type CUBMenuInstance
	= CUBIMenuInstance;

export type CUBMenuRef<T = CUBMenuInstance> = {
	isOpened: boolean;
	isCloseDisabled?: boolean;
	origin: ElementRef;
	config: CUBMenuConfig;
	overlayRef: OverlayRef;
	instance: T;
	close(): void;
	enableClose(): void;
	disableClose(): void;
	updateConfig(
		config: CUBMenuConfig
	): void;
	updatePosition(
		positionStrategy?: CUBMenuPositionStrategy
	): void;
	updateSize(
		sizeConfig: CUBMenuSizeConfig
	): void;
	afterOpened(): ReplaySubject<void>;
	afterClosed(): ReplaySubject<any>;
};

export const CUB_MENU_REF: string
	= 'CUB_MENU_REF';
export const CUB_MENU_CONTEXT: string
	= 'CUB_MENU_CONTEXT';

let refs: CUBMenuRef[] = [];

@Injectable({
	providedIn: 'any',
})
export class CUBMenuService
	extends CUBOverlayService {

	private readonly _injector: Injector
		= inject( Injector );

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {any} component
	 * @param {ObjectType=} context
	 * @param {CUBMenuConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @param {string=} eventName
	 * @return {Subject}
	 */
	public bind(
		origin: ElementRef | HTMLElement,
		component: any,
		context?: ObjectType,
		config?: CUBMenuConfig,
		callbacks?: CUBOverlayCallbacks,
		eventName: string = 'click'
	): Subject<CUBMenuRef> {
		if ( !origin ) {
			return;
		}

		const el: HTMLElement
			= coerceElement( origin );
		const opened$: Subject<CUBMenuRef>
			= new Subject<CUBMenuRef>();
		let menuRef: CUBMenuRef;

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
				if ( menuRef?.isOpened ) {
					return;
				}

				opened$.next(
					menuRef = this.open(
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
	 * @param {CUBMenuConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {CUBMenuRef}
	 */
	public open<T = CUBMenuInstance>(
		origin: ElementRef | HTMLElement,
		component: any,
		context?: ObjectType,
		config?: CUBMenuConfig,
		callbacks?: CUBOverlayCallbacks
	): CUBMenuRef<T> {
		origin = origin
			instanceof HTMLElement
			? new ElementRef( origin )
			: origin;

		component.context
			= context;

		config = {
			origin,
			type: CUBMenuType.Default,

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

				menuRef.isOpened = true;

				if ( component
						instanceof CUBMenuComponent ) {
					component.markAsOpened();
				}

				opened$.next();
				opened$.complete();

				if ( menuRef.config.type
						!== CUBMenuType.ContextMenu ) {
					return;
				}

				const viewportWidth: number
					= this.viewportWidth;
				const viewportHeight: number
					= this.viewportHeight;
				const {
					clientWidth,
					clientHeight,
				}: HTMLElement
					= oRef.overlayElement;
				let {
					offsetX,
					offsetY,
				}: CUBMenuConfig
					= menuRef.config;
				let shouldUpdatePosition: boolean;

				if ( offsetX + clientWidth
						> viewportWidth ) {
					offsetX -= clientWidth;
					shouldUpdatePosition = true;
				}

				if ( offsetY + clientHeight
						> viewportHeight ) {
					offsetY -= clientHeight;
					shouldUpdatePosition = true;
				}

				if ( !shouldUpdatePosition ) {
					return;
				}

				menuRef.updatePosition(
					this._createContextMenuPositionStrategy(
						offsetX,
						offsetY
					)
				);
			},
			onDetached: (
				oRef: OverlayRef
			) => {
				onDetached?.( oRef );

				menuRef.isOpened = false;

				if ( component
						instanceof CUBMenuComponent ) {
					component.markAsClosed();
				}

				closed$.next(
					(
						menuRef
						.instance as CUBMenuInstance
					)
					?.onClosed?.()
				);

				opened$.complete();
				closed$.complete();
			},
			onKeydown: (
				e: KeyboardEvent,
				oRef: OverlayRef
			) => {
				onKeydown?.( e, oRef );

				if ( menuRef.isCloseDisabled ) {
					return;
				}

				switch ( e.key ) {
					case 'Escape':
						e.stopPropagation();
						e.preventDefault();

						menuRef.close();
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

				if ( menuRef.isCloseDisabled ) {
					return;
				}

				menuRef.close();
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
		const menuRef: CUBMenuRef<T>
			= component.ref
			= {
				isOpened: false,
				isCloseDisabled:
					config.disableClose,
				origin,
				config,
				overlayRef,
				close: () =>
					this.close( menuRef ),
				enableClose: () =>
					this.enableClose( menuRef ),
				disableClose: () =>
					this.disableClose( menuRef ),
				updateConfig: (
					_config?: CUBMenuConfig
				) => this.updateConfig(
					menuRef,
					_config
				),
				updatePosition: (
					positionStrategy?:
						CUBMenuPositionStrategy
				) => this.updatePosition(
					menuRef,
					positionStrategy
				),
				updateSize: (
					sizeConfig?:
						CUBMenuSizeConfig
				) => this.updateSize(
					menuRef,
					sizeConfig
				),
				afterOpened: () => opened$,
				afterClosed: () => closed$,
			} as CUBMenuRef<T>;

		menuRef.instance
			= overlayRef
			.attach(
				this._createPortal(
					component,
					menuRef,
					context,
					config.viewContainerRef
				)
			)
			.instance as T;

		refs.push( menuRef );

		return menuRef;
	}

	/**
	 * @param {CUBMenuRef} menuRef
	 * @return {void}
	 */
	public close(
		menuRef: CUBMenuRef
	) {
		const canClose$: ReturnType<
			CUBMenuInstance[ 'onBeforeClose' ]
		> = menuRef
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

				menuRef
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
			( ref: CUBMenuRef ) => {
				ref.close();
			}
		);

		refs = [];
	}

	/**
	 * @param {CUBMenuRef} menuRef
	 * @return {void}
	 */
	public enableClose(
		menuRef: CUBMenuRef
	) {
		menuRef
		.isCloseDisabled = false;
	}

	/**
	 * @param {CUBMenuRef} menuRef
	 * @return {void}
	 */
	public disableClose(
		menuRef: CUBMenuRef
	) {
		menuRef
		.isCloseDisabled = true;
	}

	/**
	 * @param {CUBMenuRef} menuRef
	 * @param {CUBMenuConfig} config
	 * @return {void}
	 */
	public updateConfig(
		menuRef: CUBMenuRef,
		config: CUBMenuConfig
	) {
		menuRef.config = {
			...menuRef.config,
			...config,
		};

		menuRef.isCloseDisabled
			||= menuRef
			.config
			.disableClose;

		menuRef.updatePosition(
			this.createPositionStrategy(
				menuRef.config
			)
		);
		menuRef.updateSize(
			menuRef.config
		);
	}

	/**
	 * @param {CUBMenuRef | any} menuRef
	 * @param {CUBMenuPositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public override updatePosition(
		menuRef:
			CUBMenuRef | any,
		positionStrategy?:
			CUBMenuPositionStrategy
	) {
		super.updatePosition(
			menuRef.overlayRef,
			positionStrategy
		);
	}

	/**
	 * @param {CUBMenuRef | any} menuRef
	 * @param {CUBMenuSizeConfig=} sizeConfig
	 * @return {void}
	 */
	public override updateSize(
		menuRef:
			CUBMenuRef | any,
		sizeConfig?:
			CUBMenuSizeConfig
	) {
		super.updateSize(
			menuRef.overlayRef,
			sizeConfig
		);
	}

	/**
	 * @param {CUBMenuConfig} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {OverlayRef}
	 */
	public override createOverlay(
		config:
			CUBMenuConfig,
		callbacks?:
			CUBOverlayCallbacks
	): OverlayRef {
		switch ( config.type ) {
			case CUBMenuType.ContextMenu:
				config.positionStrategy
					= this._createContextMenuPositionStrategy(
						config.offsetX,
						config.offsetY
					);
				break;
			case CUBMenuType.FitMenu:
				const pos: CUBOverlayPosition
					= config.position.replace(
						/(start|end)-/,
						''
					) as CUBOverlayPosition;

				switch ( pos ) {
					case 'above':
					case 'below':
						config.originX
							= config.overlayX
							= 'start';
						config.originY
							= pos === 'above'
								? 'top'
								: 'bottom';
						config.overlayY
							= pos === 'above'
								? 'bottom'
								: 'top';
						config.width
							??= config
							.origin
							.nativeElement
							.clientWidth;
						config.minWidth
							??= 'min-content';
						break;
					case 'before':
					case 'after':
						config.originX
							= pos === 'before'
								? 'start'
								: 'end';
						config.overlayX
							= pos === 'before'
								? 'end'
								: 'start';
						config.originY
							= config.overlayY
							= 'top';
						config.height
							??= config
							.origin
							.nativeElement
							.clientHeight;
						config.minHeight
							??= 'min-content';
						break;
				}
				break;
		}

		const panelClass: string[] = [
			'cub-overlay-padding-pane',
			'cub-overlay-menu-pane',
		];

		if ( _.isArray( config.panelClass ) ) {
			panelClass.push(
				...config.panelClass
			);
		} else {
			panelClass.push(
				config.panelClass
			);
		}

		config.panelClass
			= panelClass;

		return super.createOverlay(
			config,
			callbacks
		);
	}

	/**
	 * @param {any} component
	 * @param {CUBMenuRef} menuRef
	 * @param {ObjectType} context
	 * @param {ViewContainerRef=} vcRef
	 * @return {Portal}
	 */
	private _createPortal(
		component: any,
		menuRef: CUBMenuRef,
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
				instanceof CUBMenuComponent
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
							provide: CUB_MENU_REF,
							useValue: menuRef,
						},
						{
							provide: CUB_MENU_CONTEXT,
							useValue: context,
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

	/**
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @return {GlobalPositionStrategy}
	 */
	private _createContextMenuPositionStrategy(
		offsetX: number,
		offsetY: number
	): GlobalPositionStrategy {
		return this
		.overlay
		.position()
		.global()
		.left( `${offsetX}px` )
		.top( `${offsetY}px` );
	}

}
