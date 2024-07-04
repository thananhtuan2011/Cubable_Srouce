import {
	ElementRef,
	inject,
	Injectable,
	Renderer2,
	RendererFactory2
} from '@angular/core';
import {
	ConfigurableFocusTrapFactory
} from '@angular/cdk/a11y';
import {
	coerceArray,
	coerceElement
} from '@angular/cdk/coercion';
import {
	Portal
} from '@angular/cdk/portal';
import {
	ConnectedOverlayPositionChange,
	ConnectedPosition,
	ConnectionPositionPair,
	FlexibleConnectedPositionStrategy,
	HorizontalConnectionPos,
	Overlay,
	OverlayConfig,
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

export type CUBOverlayResizedEvent = {
	width: number;
	height: number;
};

function getViewportWidth(): number {
	return Math.max(
		document
		.documentElement
		.clientWidth,
		window.innerWidth || 0
	);
}

function getViewportHeight(): number {
	return Math.max(
		document
		.documentElement
		.clientHeight,
		window.innerHeight || 0
	);
}

function fallback(
	origin: HorizontalConnectionPos
		| VerticalConnectionPos
): HorizontalConnectionPos
	| VerticalConnectionPos {
	switch ( origin ) {
		case 'start':
			return 'end';
		case 'end':
			return 'start';
		case 'top':
			return 'bottom';
		case 'bottom':
			return 'top';
		default:
			return origin;
	}
}

export const stack: CUBOverlayRef[] = [];

export class CUBOverlayConfig extends OverlayConfig {

	// @ts-ignore
	public hasBackdrop?: boolean | 'transparent';

	public offsetX?: number;
	public offsetY?: number;
	public originX?: HorizontalConnectionPos;
	public originY?: VerticalConnectionPos;
	public overlayX?: HorizontalConnectionPos;
	public overlayY?: VerticalConnectionPos;
	public position?: CUBOverlayPosition;
	public destroyed$?: Observable<void>;
	public stacking?: boolean;
	public autoFocus?: boolean | ElementRef | HTMLElement;
	public autoFocusOptions?: FocusOptions;
	public restoreFocus?: boolean | 'origin' | ElementRef | HTMLElement;
	public extraPanelClass?: string | string[];
	public extraBackdropClass?: string | string[];

	constructor( config: CUBOverlayConfig ) {
		super( config as OverlayConfig );

		this.offsetX = config.offsetX;
		this.offsetY = config.offsetY;
		this.originX = config.originX;
		this.originY = config.originY;
		this.overlayX = config.overlayX;
		this.overlayY = config.overlayY;
		this.position = config.position || 'below';
		this.destroyed$ = config.destroyed$ || EMPTY;
		this.stacking = config.stacking || true;
		this.autoFocus = config.autoFocus || true;
		this.autoFocusOptions = config.autoFocusOptions;
		this.restoreFocus = config.restoreFocus || true;

		const panelClass: string[] = [
			...coerceArray(
				config.panelClass
					|| 'cub-overlay-pane'
			),
			...coerceArray( config.extraPanelClass ),
		];

		this.panelClass = panelClass;

		const backdropClass: string[] = [
			...coerceArray( config.backdropClass ),
			...coerceArray( config.extraBackdropClass ),
		];

		let hasBackdrop: boolean
			= config.hasBackdrop === true;

		if ( config.hasBackdrop === 'transparent' ) {
			hasBackdrop = true;

			backdropClass.push(
				'cdk-overlay-transparent-backdrop'
			);
		}

		this.hasBackdrop = hasBackdrop;
		this.backdropClass = backdropClass;
	}

}

export class CUBOverlayRef<T = any> {

	private readonly _disposed$: Subject<void>
		= new Subject();
	private readonly _resized$: Subject<CUBOverlayResizedEvent>
		= new Subject();
	private readonly _resizeObserver: ResizeObserver
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
				if ( target === this._overlayRef.overlayElement ) {
					const domRect: DOMRect
						= target.getBoundingClientRect();

					this._resized$.next({
						width: domRect.width,
						height: domRect.height,
					});

					if ( shoudUpdatePosition ) {
						continue;
					}

					const x: number
						= domRect.left;
					const y: number
						= domRect.top;
					const offsetPlusWidth: number
						= x + contentRect.width;
					const offsetPlusHeight: number
						= y + contentRect.height;
					const pixelsOverflowX: number
						= offsetPlusWidth
							- getViewportWidth();
					const pixelsOverflowY: number
						= offsetPlusHeight
							- getViewportHeight();

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

			this.updatePosition();
		});

	private _config: CUBOverlayConfig;
	private _origin: ElementRef;
	private _instance: T;
	private _overlayRef: OverlayRef;
	private _overlay: Overlay;
	private _renderer: Renderer2;
	private _focusTrapFactory: ConfigurableFocusTrapFactory;
	private _onDisposed: Observable<void>;
	private _onResized: Observable<CUBOverlayResizedEvent>;
	private _onAttached: Observable<void>;
	private _onDetached: Observable<void>;
	private _onKeyDown: Observable<KeyboardEvent>;
	private _onBackdropClicked: Observable<MouseEvent>;
	private _onOutsideClicked: Observable<MouseEvent>;
	private _onPositionChanges: Observable<ConnectedOverlayPositionChange>;
	private _originDOMRemoveUnlisten: () => void;

	get originalRef(): OverlayRef {
		return this._overlayRef;
	}

	get config(): CUBOverlayConfig {
		return this._config;
	}

	get element(): HTMLElement {
		return this._overlayRef.overlayElement;
	}

	get backdropElement(): HTMLElement {
		return this._overlayRef.backdropElement;
	}

	get origin(): ElementRef {
		return this._origin;
	}

	get instance(): T {
		return this._instance;
	}

	get isAttached(): boolean {
		return this._overlayRef.hasAttached();
	}

	get hasBackdrop(): boolean {
		return this
		._overlayRef
		.getConfig()
		.hasBackdrop;
	}

	constructor(
		config: CUBOverlayConfig,
		origin: null | ElementRef | HTMLElement,
		_overlay: Overlay,
		_renderer: Renderer2,
		_focusTrapFactory: ConfigurableFocusTrapFactory
	) {
		this._overlay = _overlay;
		this._renderer = _renderer;
		this._focusTrapFactory = _focusTrapFactory;

		this._config = new CUBOverlayConfig({
			...config,

			scrollStrategy:
				this._createScrollStrategy( config ),
			positionStrategy:
				this._createPositionStrategy( config ),
		});
		this._overlayRef
			= this._overlay.create(
				this._config as OverlayConfig
			);

		// Add this overlay ref to stack
		if ( this._config.stacking ) {
			stack.unshift( this );
		}

		// Set origin
		this.setOrigin( origin );

		const overlayEl: HTMLElement
			= this._overlayRef.overlayElement;

		// Observe resize for this overlay
		// and the document
		this._resizeObserver.observe(
			overlayEl
		);
		this._resizeObserver.observe(
			document.documentElement
		);

		let lastFocusElement: HTMLElement;

		this
		.onAttached()
		.subscribe(() => {
			const {
				autoFocus,
				autoFocusOptions,
				restoreFocus,
			}: CUBOverlayConfig = this._config;

			if ( autoFocus ) {
				if ( autoFocus === true ) {
					this
					._focusTrapFactory
					.create( overlayEl )
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
					lastFocusElement
						= this._origin?.nativeElement;
				} else {
					lastFocusElement
						= coerceElement( restoreFocus );
				}
			}
		});

		this
		.onDetached()
		.subscribe(() => {
			if ( !lastFocusElement
				|| _getFocusedElementPierceShadowDom()
					!== document.body ) {
				return;
			}

			lastFocusElement.focus();
		});

		this
		.onDisposed()
		.subscribe(() => {
			this._disposed$.complete();
			this._resized$.complete();
			this._resizeObserver.disconnect();

			this._originDOMRemoveUnlisten?.();
		});

		this
		.onPositionChanges()
		.subscribe((
			change: ConnectedOverlayPositionChange
		) => {
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

			// Remove old position classes
			this
			._overlayRef
			.removePanelClass([
				'before',
				'after',
				'above',
				'below',
			]);

			// Add new position class
			this
			._overlayRef
			.addPanelClass( pos );
		});
	}

	/**
	 * Gets an observable that emits
	 * when the overlay has been disposed.
	 * @returns An observable.
	 */
	public onDisposed(): Observable<void> {
		return this._onDisposed
			||= this._disposed$.pipe(
				take( 1 )
			);
	}

	/**
	 * Gets an observable that emits
	 * when the overlay has been resized.
	 * @returns An observable.
	 */
	public onResized(): Observable<CUBOverlayResizedEvent> {
		return this._onResized
			||= this._resized$.pipe(
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable that emits
	 * when the overlay has been attached.
	 * @returns An observable.
	 */
	public onAttached(): Observable<void> {
		return this._onAttached
			||= this
			._overlayRef
			.attachments()
			.pipe(
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable that emits
	 * when the overlay has been detached.
	 * @returns An observable.
	 */
	public onDetached(): Observable<void> {
		return this._onDetached
			||= this
			._overlayRef
			.detachments()
			.pipe(
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable of keydown
	 * events targeted to this overlay.
	 * @returns An observable.
	 */
	public onKeydown(): Observable<KeyboardEvent> {
		return this._onKeyDown
			||= this
			._overlayRef
			.keydownEvents()
			.pipe(
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable that emits
	 * when the backdrop has been clicked.
	 * @returns An observable.
	 */
	public onBackdropClicked(): Observable<MouseEvent> {
		return this._onBackdropClicked
			||= this
			._overlayRef
			.backdropClick()
			.pipe(
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable of pointer events
	 * targeted outside this overlay.
	 * @returns An observable.
	 */
	public onOutsideClicked(): Observable<MouseEvent> {
		return this._onOutsideClicked
			||= this
			._overlayRef
			.outsidePointerEvents()
			.pipe(
				filter(( e: MouseEvent ) => {
					return !this
					.origin
					?.nativeElement
					.contains( e.target as HTMLElement )
						&& ( !this._config.stacking
							|| this === stack[ 0 ] );
				}),
				takeUntil( this._config.destroyed$ ),
				takeUntil( this._disposed$ )
			);
	}

	/**
	 * Gets an observable sequence of position changes.
	 * Returns a empty observable if the postion strategy
	 * is not FlexibleConnectedPositionStrategy.
	 * @returns An observable.
	 */
	public onPositionChanges():
		Observable<ConnectedOverlayPositionChange> {
		return this._onPositionChanges
			||= (
				this
				._overlayRef
				.getConfig()
				.positionStrategy as
					FlexibleConnectedPositionStrategy
			).positionChanges || EMPTY;
	}

	/**
	 * Cleans up the overlay from the DOM.
	 */
	public dispose() {
		this._overlayRef.dispose();

		this._disposed$.next();
	}

	/**
	 * Attaches a portal to this overlay.
	 * @returns An instance of portal.
	 */
	public attach( portal: Portal<T> ): T {
		return this._instance
			= this
			._overlayRef
			.attach( portal )
			.instance as T;
	}

	/**
	 * Detaches a portal to this overlay.
	 * @returns The portal detachment result.
	 */
	public detach(): any {
		return this._overlayRef.detach();
	}

	/**
	 * Sets origin to overlay connect.
	 * @param origin
	 */
	public setOrigin(
		origin: ElementRef | HTMLElement
	) {
		// Unlisten on old origin
		if ( this._origin ) {
			this._resizeObserver.unobserve(
				this._origin.nativeElement
			);

			this._originDOMRemoveUnlisten?.();
		}

		this._origin
			= origin instanceof HTMLElement
				? new ElementRef( origin )
				: origin;

		this.updatePosition(
			this._createPositionStrategy(
				this._config
			)
		);

		if ( !this._origin ) {
			return;
		}

		const originEl: HTMLElement
			= this._origin.nativeElement;

		this._resizeObserver.observe(
			originEl
		);

		this._originDOMRemoveUnlisten
			= this._renderer.listen(
				originEl.parentElement,
				'DOMNodeRemoved',
				( e: Event ) => {
					if ( e.target !== originEl ) {
						return;
					}

					this._resizeObserver.unobserve(
						originEl
					);

					this.dispose();
				});
	}

	/**
	 * Add a CSS class or an array
	 * of classes to the overlay pane.
	 * @param classes
	 */
	public addPanelClass(
		classes: string | string[]
	) {
		this
		._overlayRef
		.addPanelClass( classes );
	}

	/**
	 * Remove a CSS class or an array
	 * of classes from the overlay pane.
	 * @param classes
	 */
	public removePanelClass(
		classes: string | string[]
	) {
		this
		._overlayRef
		.removePanelClass( classes );
	}

	/**
	 * Updates overlay config.
	 * @param config Configuration updated to the overlay.
	 */
	public updateConfig(
		config: CUBOverlayConfig
	) {
		this._config = new CUBOverlayConfig({
			...this._config,
			...config,
		});

		this.updatePosition(
			this._createPositionStrategy(
				this._config
			)
		);

		this.updateSize( this._config );
	}

	/**
	 * Updates overlay position.
	 * @param positionStrategy Strategy updated to the overlay.
	 */
	public updatePosition(
		positionStrategy?: PositionStrategy
	) {
		positionStrategy
			? this
			._overlayRef
			.updatePositionStrategy(
				positionStrategy
			)
			: this
			._overlayRef
			.updatePosition();
	}

	/**
	 * Updates overlay size.
	 * @param sizeConfig Config updated to the overlay.
	 */
	public updateSize(
		sizeConfig: OverlaySizeConfig
	) {
		this
		._overlayRef
		.updateSize( sizeConfig );
	}

	/**
	 * Creates a position strategy in the case of
	 * configuration without passing in.
	 * @param config
	 * @return A position strategy.
	 */
	private _createPositionStrategy(
		config: CUBOverlayConfig
	): PositionStrategy {
		if ( config.positionStrategy ) {
			return config.positionStrategy;
		}

		if ( !this._origin ) {
			return this
			._overlay
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
			= fallback( originX ) as HorizontalConnectionPos;
		const originFallbackY: VerticalConnectionPos
			= fallback( originY ) as VerticalConnectionPos;
		const overlayFallbackX: HorizontalConnectionPos
			= fallback( overlayX ) as HorizontalConnectionPos;
		const overlayFallbackY: VerticalConnectionPos
			= fallback( overlayY ) as VerticalConnectionPos;
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
		._overlay
		.position()
		.flexibleConnectedTo( this._origin )
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
	 * Creates a scroll strategy in the case of
	 * configuration without passing in.
	 * @param config
	 * @return A scroll strategy.
	 */
	private _createScrollStrategy(
		config: CUBOverlayConfig
	): ScrollStrategy {
		if ( config.scrollStrategy ) {
			return config.scrollStrategy;
		}

		return this
		._overlay
		.scrollStrategies
		.block();
	}

}

@Injectable({
	providedIn: 'root',
})
export class CUBOverlay2Service {

	protected readonly focusTrapFactory:
		ConfigurableFocusTrapFactory
		= inject( ConfigurableFocusTrapFactory );
	protected readonly overlay: Overlay
		= inject( Overlay );
	protected readonly rendererFactory: RendererFactory2
		= inject( RendererFactory2 );

	protected renderer: Renderer2;

	constructor() {
		this.renderer
			= this
			.rendererFactory
			.createRenderer( null, null );
	}

	/**
	 * Creates an overlay
	 * @param config Configuration applied to the overlay.
	 * @param origin The origin connect with the overlay.
	 * @param ctor A overlay constructor.
	 * @returns Reference to the created overlay.
	 */
	public create(
		config: CUBOverlayConfig,
		origin: null | ElementRef | HTMLElement = null,
		ctor: typeof CUBOverlayRef = CUBOverlayRef
	): CUBOverlayRef {
		return new ctor(
			config,
			origin,
			this.overlay,
			this.renderer,
			this.focusTrapFactory
		);
	}

}
