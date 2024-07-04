import {
	Directive,
	ElementRef,
	inject,
	Injectable,
	Input,
	OnDestroy
} from '@angular/core';
import {
	ConfigurableFocusTrapFactory
} from '@angular/cdk/a11y';
import {
	Direction
} from '@angular/cdk/bidi';
import {
	coerceArray,
	coerceElement
} from '@angular/cdk/coercion';
import {
	ConnectedOverlayPositionChange,
	ConnectedPosition,
	ConnectionPositionPair,
	FlexibleConnectedPositionStrategy,
	HorizontalConnectionPos,
	Overlay,
	OverlayRef,
	OverlaySizeConfig,
	PositionStrategy,
	ScrollStrategy,
	VerticalConnectionPos
} from '@angular/cdk/overlay';
import {
	_getFocusedElementPierceShadowDom
} from '@angular/cdk/platform';
import {
	EMPTY,
	fromEvent,
	Observable,
	Subject
} from 'rxjs';
import {
	filter,
	take,
	takeUntil
} from 'rxjs/operators';
import ResizeObserver
	from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	Memoize
} from 'angular-core';
import { stack } from './overlay2';

export type CUBOverlayPosition
	= 'above'
		| 'start-above'
		| 'end-above'
		| 'below'
		| 'start-below'
		| 'end-below'
		| 'before'
		| 'start-before'
		| 'end-before'
		| 'after'
		| 'start-after'
		| 'end-after';
export type CUBOverlayHasBackdrop
	= boolean | 'transparent';
export type CUBOverlaySizeConfig
	= OverlaySizeConfig;

export type CUBOverlayConfig = {
	origin?: ElementRef;

	panelClass?: string | string[];
	backdropClass?: string | string[];
	positionStrategy?: PositionStrategy;
	scrollStrategy?: ScrollStrategy;
	width?: string | number;
	minWidth?: string | number;
	maxWidth?: string | number;
	height?: string | number;
	minHeight?: string | number;
	maxHeight?: string | number;
	offsetX?: number;
	offsetY?: number;
	originX?: HorizontalConnectionPos;
	originY?: VerticalConnectionPos;
	overlayX?: HorizontalConnectionPos;
	overlayY?: VerticalConnectionPos;
	direction?: Direction;

	position?: CUBOverlayPosition;
	hasBackdrop?: CUBOverlayHasBackdrop;
	destroyed$?: Subject<void>;
	stacking?: boolean;
	autoFocus?: boolean
		| ElementRef
		| HTMLElement;
	autoFocusOptions?: FocusOptions;
	restoreFocus?: boolean
		| 'origin'
		| ElementRef
		| HTMLElement;
};

export type CUBOverlayCallbacks = {
	onInit?(
		overlayRef: OverlayRef
	): void;
	onAttached?(
		overlayRef: OverlayRef
	): void;
	onDetached?(
		overlayRef: OverlayRef
	): void;
	onResized?(
		overlayRef: OverlayRef
	): void;
	onKeydown?(
		e: KeyboardEvent,
		overlayRef: OverlayRef
	): void;
	onBackdropClicked?(
		e: MouseEvent,
		overlayRef: OverlayRef
	): void;
	onOutsideClicked?(
		e: MouseEvent,
		overlayRef: OverlayRef
	): void;
	onPositionChanges?(
		change: ConnectedOverlayPositionChange,
		overlayRef: OverlayRef
	): void;
};

@Injectable({
	providedIn: 'root',
})
export class CUBOverlayService {

	protected readonly focusTrapFactory:
		ConfigurableFocusTrapFactory
		= inject( ConfigurableFocusTrapFactory );
	protected readonly overlay: Overlay
		= inject( Overlay );

	get viewportWidth(): number {
		return Math.max(
			document
			.documentElement
			.clientWidth,
			window.innerWidth || 0
		);
	}

	get viewportHeight(): number {
		return Math.max(
			document
			.documentElement
			.clientHeight,
			window.innerHeight || 0
		);
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @return {CUBOverlayConfig}
	 */
	public createConfig(
		config: CUBOverlayConfig
	): CUBOverlayConfig {
		const panelClass: string[] = [
			'cub-overlay-pane',

			...coerceArray( config?.panelClass ),
		];

		config = {
			position: 'below',
			stacking: true,
			autoFocus: true,
			restoreFocus: true,

			...config,

			panelClass,
		};

		return config;
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {OverlayRef}
	 */
	public createOverlay(
		config: CUBOverlayConfig,
		callbacks?: CUBOverlayCallbacks
	): OverlayRef {
		config = this.createConfig( config );

		const backdropClass: string[] = [
			...coerceArray( config.backdropClass ),
		];

		let hasBackdrop: boolean
			= config.hasBackdrop === true;

		if ( config.hasBackdrop === 'transparent' ) {
			hasBackdrop = true;

			backdropClass.push(
				'cdk-overlay-transparent-backdrop'
			);
		}

		const overlayRef: OverlayRef
			= this.overlay.create({
				hasBackdrop,
				backdropClass,
				panelClass: config.panelClass,
				width: config.width,
				minWidth: config.minWidth,
				maxWidth: config.maxWidth,
				height: config.height,
				minHeight: config.minHeight,
				maxHeight: config.maxHeight,
				direction: config.direction,
				scrollStrategy:
					this.createScrollStrategy( config ),
				positionStrategy:
					this.createPositionStrategy( config ),
			});
		const resizeObserver: ResizeObserver
			= new ResizeObserver((
				entries: ResizeObserverEntry[]
			) => {
				let shoudUpdatePosition: boolean;

				for (
					const {
						target,
						contentRect,
					} of entries
				) {
					if ( target === overlayRef.overlayElement ) {
						callbacks?.onResized?.( overlayRef );

						if ( shoudUpdatePosition ) {
							continue;
						}

						const domReact: DOMRect
							= target.getBoundingClientRect();
						const x: number
							= domReact.left;
						const y: number
							= domReact.top;
						const offsetPlusWidth: number
							= x + contentRect.width;
						const offsetPlusHeight: number
							= y + contentRect.height;
						const pixelsOverflowX: number
							= offsetPlusWidth
								- this.viewportWidth;
						const pixelsOverflowY: number
							= offsetPlusHeight
								- this.viewportHeight;

						shoudUpdatePosition
							= x < 0
								|| y < 0
								|| pixelsOverflowX > 1
								|| pixelsOverflowY > 1;
					} else {
						shoudUpdatePosition = true;
					}
				}

				if ( !shoudUpdatePosition ) {
					return;
				}

				overlayRef.updatePosition();
			});
		const el: HTMLElement
			= config.origin?.nativeElement;
		const destroyed$: Observable<void>
			= config.destroyed$ || EMPTY;
		let lastFocusElement: HTMLElement;

		if ( el ) {
			fromEvent(
				el.parentElement,
				'DOMNodeRemoved'
			)
			.pipe(
				takeUntil( destroyed$ ),
				takeUntil( overlayRef.detachments() )
			)
			.subscribe(( e: Event ) => {
				if ( e.target !== el ) {
					return;
				}

				overlayRef.dispose();
			});
		}

		callbacks?.onInit?.( overlayRef );

		overlayRef
		.attachments()
		.pipe(
			take( 1 ),
			takeUntil( destroyed$ )
		)
		.subscribe(() => {
			callbacks?.onAttached?.( overlayRef );

			if ( config.stacking ) {
				setTimeout(
					() => {
						stack
						.unshift( overlayRef as any );
					},
					100
				);
			}

			resizeObserver.observe(
				el || document.documentElement
			);
			resizeObserver.observe(
				overlayRef.overlayElement
			);

			const {
				autoFocus,
				autoFocusOptions,
				restoreFocus,
			}: CUBOverlayConfig = config;

			if ( autoFocus ) {
				if ( autoFocus === true ) {
					this
					.focusTrapFactory
					.create( overlayRef.overlayElement )
					.focusInitialElementWhenReady(
						autoFocusOptions
					);
				} else {
					coerceElement( autoFocus )
					.focus( autoFocusOptions );
				}
			}

			if ( restoreFocus ) {
				if ( restoreFocus === true ) {
					lastFocusElement
						= _getFocusedElementPierceShadowDom();
				} else if ( restoreFocus === 'origin' ) {
					lastFocusElement = el;
				} else {
					lastFocusElement
						= coerceElement( restoreFocus );
				}
			}
		});

		overlayRef
		.detachments()
		.pipe(
			take( 1 ),
			takeUntil( destroyed$ )
		)
		.subscribe(() => {
			callbacks?.onDetached?.( overlayRef );

			if ( config.stacking ) {
				setTimeout(() => {
					_.pull(
						stack,
						overlayRef as any
					);
				});
			}

			if ( !lastFocusElement
				|| _getFocusedElementPierceShadowDom()
					!== document.body ) {
				return;
			}

			lastFocusElement.focus();
		});

		overlayRef
		.keydownEvents()
		.pipe(
			takeUntil( destroyed$ ),
			takeUntil( overlayRef.detachments() )
		)
		.subscribe(( e: KeyboardEvent ) => {
			callbacks?.onKeydown?.(
				e,
				overlayRef
			);
		});

		overlayRef
		.backdropClick()
		.pipe(
			takeUntil( destroyed$ ),
			takeUntil( overlayRef.detachments() )
		)
		.subscribe(( e: MouseEvent ) => {
			callbacks?.onBackdropClicked?.(
				e,
				overlayRef
			);

			e.stopPropagation();
		});

		overlayRef
		.outsidePointerEvents()
		.pipe(
			filter(( e: MouseEvent ) => {
				const target: HTMLElement
					= e.target as HTMLElement;

				return !el?.contains( target )
					&& ( !config.stacking
						|| overlayRef as any
							=== stack[ 0 ] );
			}),
			takeUntil( destroyed$ ),
			takeUntil( overlayRef.detachments() )
		)
		.subscribe(( e: MouseEvent ) => {
			callbacks?.onOutsideClicked?.(
				e,
				overlayRef
			);
		});

		(
			overlayRef
			.getConfig()
			.positionStrategy as
				FlexibleConnectedPositionStrategy
		)
		.positionChanges
		?.pipe(
			takeUntil( destroyed$ ),
			takeUntil( overlayRef.detachments() )
		)
		.subscribe((
			change: ConnectedOverlayPositionChange
		) => {
			callbacks?.onPositionChanges?.(
				change,
				overlayRef
			);

			const {
				originX,
				originY,
				overlayX,
				overlayY,
			}: ConnectionPositionPair
				= change.connectionPair;
			let pos: CUBOverlayPosition;

			if ( originX === 'start'
				&& overlayX === 'end' ) {
				pos = 'before';
			} else if ( originX === 'end'
				&& overlayX === 'start' ) {
				pos = 'after';
			} else if ( originY === 'top'
				&& overlayY === 'bottom' ) {
				pos = 'above';
			} else if ( originY === 'bottom'
				&& overlayY === 'top' ) {
				pos = 'below';
			}

			overlayRef.addPanelClass( pos );
		});

		return overlayRef;
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @return {ScrollStrategy}
	 */
	public createScrollStrategy(
		config: CUBOverlayConfig
	): ScrollStrategy {
		if ( config.scrollStrategy ) {
			return config.scrollStrategy;
		}

		return this
		.overlay
		.scrollStrategies
		.block();
	}

	/**
	 * @param {CUBOverlayConfig} config
	 * @return {PositionStrategy}
	 */
	public createPositionStrategy(
		config: CUBOverlayConfig
	): PositionStrategy {
		if ( config.positionStrategy ) {
			return config.positionStrategy;
		}

		if ( !config.origin ) {
			return this
			.overlay
			.position()
			.global()
			.centerHorizontally()
			.centerVertically();
		}

		const position: CUBOverlayPosition
			= config.position;
		let originX: HorizontalConnectionPos
			= config.originX;
		let originY: VerticalConnectionPos
			= config.originY;
		let overlayX: HorizontalConnectionPos
			= config.overlayX;
		let overlayY: VerticalConnectionPos
			= config.overlayY;

		switch ( position ) {
			case 'above':
				originY ||= 'top';
				overlayY ||= 'bottom';
				break;
			case 'start-above':
				originX ||= 'start';
				overlayX ||= 'start';
				originY ||= 'top';
				overlayY ||= 'bottom';
				break;
			case 'end-above':
				originX ||= 'end';
				overlayX ||= 'end';
				originY ||= 'top';
				overlayY ||= 'bottom';
				break;
			case 'below':
				originY ||= 'bottom';
				overlayY ||= 'top';
				break;
			case 'start-below':
				originX ||= 'start';
				overlayX ||= 'start';
				originY ||= 'bottom';
				overlayY ||= 'top';
				break;
			case 'end-below':
				originX ||= 'end';
				overlayX ||= 'end';
				originY ||= 'bottom';
				overlayY ||= 'top';
				break;
			case 'before':
				originX ||= 'start';
				overlayX ||= 'end';
				break;
			case 'start-before':
				originX ||= 'start';
				overlayX ||= 'end';
				originY ||= 'top';
				overlayY ||= 'top';
				break;
			case 'end-before':
				originX ||= 'start';
				overlayX ||= 'end';
				originY ||= 'bottom';
				overlayY ||= 'bottom';
				break;
			case 'after':
				originX ||= 'end';
				overlayX ||= 'start';
				break;
			case 'start-after':
				originX ||= 'end';
				overlayX ||= 'start';
				originY ||= 'top';
				overlayY ||= 'top';
				break;
			case 'end-after':
				originX ||= 'end';
				overlayX ||= 'start';
				originY ||= 'bottom';
				overlayY ||= 'bottom';
				break;
		}

		originX ||= 'center';
		overlayX ||= 'center';
		originY ||= 'center';
		overlayY ||= 'center';

		const originFallbackX: HorizontalConnectionPos
			= this._fallbackX( originX );
		const originFallbackY: VerticalConnectionPos
			= this._fallbackY( originY );
		const overlayFallbackX: HorizontalConnectionPos
			= this._fallbackX( overlayX );
		const overlayFallbackY: VerticalConnectionPos
			= this._fallbackY( overlayY );
		const connectedPosition: ConnectedPosition
			= {
				originX,
				originY,
				overlayX,
				overlayY,
			};
		let offsetFallbackX: number;
		let offsetFallbackY: number;

		if ( _.isFinite( config.offsetX ) ) {
			connectedPosition.offsetX
				= config.offsetX;

			offsetFallbackX
				= -config.offsetX;
		}

		if ( _.isFinite( config.offsetY ) ) {
			connectedPosition.offsetY
				= config.offsetY;

			offsetFallbackY
				= -config.offsetY;
		}

		return this
		.overlay
		.position()
		.flexibleConnectedTo( config.origin )
		.withFlexibleDimensions( false )
		.withPush( true )
		.withPositions([
			connectedPosition,
			{
				...connectedPosition,

				originX: originFallbackX,
				overlayX: overlayFallbackX,
				offsetX: offsetFallbackX,
			},
			{
				...connectedPosition,

				originY: originFallbackY,
				overlayY: overlayFallbackY,
				offsetY: offsetFallbackY,
			},
			{
				...connectedPosition,

				originX: 'start',
				overlayX: 'start',
			},
			{
				...connectedPosition,

				originX: 'end',
				overlayX: 'end',
			},
			{
				...connectedPosition,

				originY: 'top',
				overlayY: 'top',
			},
			{
				...connectedPosition,

				originY: 'bottom',
				overlayY: 'bottom',
			},
			{
				...connectedPosition,

				originX: 'start',
				originY: originFallbackY,
				overlayX: 'start',
				overlayY: overlayFallbackY,
				offsetY: offsetFallbackY,
			},
			{
				...connectedPosition,

				originX: 'end',
				originY: originFallbackY,
				overlayX: 'end',
				overlayY: overlayFallbackY,
				offsetY: offsetFallbackY,
			},
			{
				...connectedPosition,

				originX: originFallbackX,
				originY: 'top',
				overlayX: overlayFallbackX,
				overlayY: 'top',
				offsetX: offsetFallbackX,
			},
			{
				...connectedPosition,

				originX: originFallbackX,
				originY: 'bottom',
				overlayX: overlayFallbackX,
				overlayY: 'bottom',
				offsetX: offsetFallbackX,
			},
		]);
	}

	/**
	 * @param {OverlayRef} overlayRef
	 * @param {PositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public updatePosition(
		overlayRef: OverlayRef,
		positionStrategy?: PositionStrategy
	) {
		positionStrategy
			? overlayRef?.updatePositionStrategy(
				positionStrategy
			)
			: overlayRef?.updatePosition();
	}

	/**
	 * @param {OverlayRef} overlayRef
	 * @param {CUBOverlaySizeConfig=} sizeConfig
	 * @return {void}
	 */
	public updateSize(
		overlayRef: OverlayRef,
		sizeConfig: CUBOverlaySizeConfig = overlayRef.getConfig()
	) {
		overlayRef.updateSize( sizeConfig );
	}

	/**
	 * @param {HorizontalConnectionPos} origin
	 * @return {HorizontalConnectionPos}
	 */
	@Memoize()
	private _fallbackX(
		origin: HorizontalConnectionPos
	): HorizontalConnectionPos {
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
	private _fallbackY(
		origin: VerticalConnectionPos
	): VerticalConnectionPos {
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

@Directive()
export class CUBOverlayDispatcher implements OnDestroy {

	@Input() public origin: ElementRef | HTMLElement;
	@Input() public position: CUBOverlayPosition;
	@Input() public hasBackdrop: CUBOverlayHasBackdrop;
	@Input() public otherConfig: CUBOverlayConfig;

	public isAttached: boolean;
	public isDestroyed: boolean;
	public overlayRef: OverlayRef;

	protected readonly destroyed$: Subject<void>
		= new Subject<void>();

	protected overlayService: CUBOverlayService;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _callbacks: CUBOverlayCallbacks
		= {
			onInit: (
				overlayRef: OverlayRef
			) => {
				this.overlayRef = overlayRef;

				this.onInit?.( overlayRef );
			},
			onAttached: (
				overlayRef: OverlayRef
			) => {
				this.isAttached = true;

				this.onAttached?.( overlayRef );
			},
			onDetached: (
				overlayRef: OverlayRef
			) => {
				this.isAttached = false;

				this.onDetached?.( overlayRef );
			},
			onResized:
				this.onResized?.bind( this ),
			onKeydown:
				this.onKeydown?.bind( this ),
			onBackdropClicked:
				this.onBackdropClicked?.bind( this ),
			onOutsideClicked:
				this.onOutsideClicked?.bind( this ),
			onPositionChanges:
				this.onPositionChanges?.bind( this ),
		};

	private _origin: ElementRef;

	get originElement(): ElementRef {
		this._origin
			||= this.origin instanceof HTMLElement
				? new ElementRef( this.origin )
				: this.origin;

		return this._origin !== undefined
			? this._origin
			: this._elementRef;
	}

	get viewportWidth(): number {
		return this
		.overlayService
		.viewportWidth;
	}

	get viewportHeight(): number {
		return this
		.overlayService
		.viewportHeight;
	}

	/**
	 * @constructor
	 * @param {CUBOverlayService=} service
	 */
	constructor(
		service: CUBOverlayService = inject( CUBOverlayService )
	) {
		this.overlayService = service;
	}

	ngOnDestroy() {
		this.isDestroyed = true;

		this.destroyed$.next();
		this.destroyed$.complete();

		this.overlayRef?.dispose();
	}

	/**
	 * @param {PositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public updatePosition(
		positionStrategy?:
			PositionStrategy
	) {
		this
		.overlayService
		.updatePosition(
			this.overlayRef,
			positionStrategy
		);
	}

	/**
	 * @param {CUBOverlaySizeConfig=} sizeConfig
	 * @return {void}
	 */
	public updateSize(
		sizeConfig?:
			CUBOverlaySizeConfig
	) {
		this
		.overlayService
		.updateSize(
			this.overlayRef,
			sizeConfig
		);
	}

	/**
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onInit?(
		overlayRef: OverlayRef
	);

	/**
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onAttached?(
		overlayRef: OverlayRef
	);

	/**
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onDetached?(
		overlayRef: OverlayRef
	);

	/**
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onResized?(
		overlayRef: OverlayRef
	);

	/**
	 * @param {KeyboardEvent} e
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onKeydown?(
		e: KeyboardEvent,
		overlayRef: OverlayRef
	);

	/**
	 * @param {MouseEvent} e
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onBackdropClicked?(
		e: MouseEvent,
		overlayRef: OverlayRef
	);

	/**
	 * @param {MouseEvent} e
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onOutsideClicked?(
		e: MouseEvent,
		overlayRef: OverlayRef
	);

	/**
	 * @param {ConnectedOverlayPositionChange} change
	 * @param {OverlayRef} overlayRef
	 * @return {void}
	 */
	protected onPositionChanges?(
		change: ConnectedOverlayPositionChange,
		overlayRef: OverlayRef
	);

	/**
	 * @return {void}
	 */
	protected init() {
		this
		.overlayService
		.createOverlay(
			this.getConfig(),
			this._callbacks
		);
	}

	/**
	 * @return {CUBOverlayConfig}
	 */
	protected getConfig(): CUBOverlayConfig {
		return {
			..._.omitBy(
				{
					origin:
						this.originElement,
					position:
						this.position,
					hasBackdrop:
						this.hasBackdrop,
					destroyed$:
						this.destroyed$,
				},
				_.isUndefined
			),
			...this.otherConfig,
		};
	}

	/**
	 * @return {CUBOverlayCallbacks}
	 */
	protected getCallbacks(): CUBOverlayCallbacks {
		return this._callbacks;
	}

}
