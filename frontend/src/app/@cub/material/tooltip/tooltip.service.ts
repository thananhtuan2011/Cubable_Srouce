import {
	ElementRef,
	inject,
	Injectable,
	Renderer2,
	RendererFactory2,
	TemplateRef,
	ViewContainerRef
} from '@angular/core';
import {
	coerceArray,
	coerceElement
} from '@angular/cdk/coercion';
import {
	OverlayRef,
	OverlaySizeConfig,
	PositionStrategy
} from '@angular/cdk/overlay';
import {
	ComponentPortal
} from '@angular/cdk/portal';
import {
	EMPTY,
	fromEvent,
	ReplaySubject,
	Subject
} from 'rxjs';
import {
	takeUntil
} from 'rxjs/operators';
import ResizeObserver
	from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	CUBOverlayCallbacks,
	CUBOverlayConfig,
	CUBOverlayService,
	CUBOverlaySizeConfig
} from '../overlay';

import {
	CUBTooltipComponent,
	CUBTooltipType
} from './tooltip.component';

export type CUBTooltipPositionStrategy
	= PositionStrategy;
export type CUBTooltipSizeConfig
	= CUBOverlaySizeConfig;
export type CUBTooltipConfig
	= Omit<
		CUBOverlayConfig,
		'stacking'
			| 'autoFocus'
			| 'restoreFocus'
	> & {
		type?: CUBTooltipType;
		disableClose?: boolean;
		viewContainerRef?: ViewContainerRef;
	};

export type CUBTooltipRef = {
	isOpened: boolean;
	isCloseDisabled: boolean;
	isOverlayHover: boolean;
	origin: ElementRef;
	config: CUBTooltipConfig;
	overlayRef: OverlayRef;
	instance: CUBTooltipComponent;
	close(): void;
	enableClose(): void;
	disableClose(): void;
	setMessage(
		message: string
			| TemplateRef<any>
	): void;
	updateConfig(
		config: CUBTooltipConfig
	): void;
	updatePosition(
		positionStrategy?:
			PositionStrategy
	): void;
	updateSize(
		sizeConfig:
			OverlaySizeConfig
	): void;
	afterOpened(): ReplaySubject<void>;
	afterClosed(): ReplaySubject<void>;
};

@Injectable({
	providedIn: 'any',
})
export class CUBTooltipService
	extends CUBOverlayService {

	private readonly _rendererFactory: RendererFactory2
		= inject( RendererFactory2 );

	private _renderer: Renderer2;

	/**
	 * @constructor
	 */
	constructor() {
		super();

		this._renderer
			= this
			._rendererFactory
			.createRenderer( null, null );
	}

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {string | TemplateRef<any>} message
	 * @param {ObjectType=} context
	 * @param {CUBTooltipConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @param {string=} eventName
	 * @return {Subject}
	 */
	public bind(
		origin: ElementRef | HTMLElement,
		message: string | TemplateRef<any>,
		context?: ObjectType,
		config?: CUBTooltipConfig,
		callbacks?: CUBOverlayCallbacks,
		eventName: string = 'mousemove'
	): Subject<CUBTooltipRef> {
		if ( !origin ) return;

		const el: HTMLElement
			= coerceElement( origin );
		const opened$: Subject<CUBTooltipRef>
			= new Subject<CUBTooltipRef>();
		let tooltipRef: CUBTooltipRef;

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
				if ( tooltipRef?.isOpened ) {
					return;
				}

				opened$.next(
					tooltipRef = this.open(
						origin,
						message,
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
	 * @param {string | TemplateRef<any>} message
	 * @param {ObjectType=} context
	 * @param {CUBTooltipConfig=} config
	 * @param {CUBOverlayCallbacks=} callbacks
	 * @return {CUBTooltipRef}
	 */
	public open(
		origin: ElementRef | HTMLElement,
		message: string | TemplateRef<any>,
		context?: ObjectType,
		config?: CUBTooltipConfig,
		callbacks?: CUBOverlayCallbacks
	): CUBTooltipRef {
		origin = origin instanceof HTMLElement
			? new ElementRef( origin )
			: origin;

		config = {
			origin,

			...this.createConfig( config ),
		};

		const {
			onAttached,
			onDetached,
		}: CUBOverlayCallbacks
			= callbacks || {};
		let resizeObserver: ResizeObserver;
		let overlayMousemoveEventUnlisten:
			() => void;
		let overlayMouseleaveEventUnlisten:
			() => void;

		callbacks = {
			...callbacks,

			onAttached: (
				oRef: OverlayRef
			) => {
				onAttached?.( oRef );

				tooltipRef.isOpened = true;

				opened$.next();

				resizeObserver
					= new ResizeObserver(() => {
						const el: HTMLElement
							= tooltipRef
							.config
							.origin
							.nativeElement;

						if ( !!el.clientWidth
							|| !!el.clientHeight ) {
							return;
						}

						const domRect: DOMRect
							= el.getBoundingClientRect();

						if ( !!domRect.width
							|| !!domRect.height ) {
							return;
						}

						tooltipRef.close();
					});

				resizeObserver.observe(
					tooltipRef
					.config
					.origin
					.nativeElement
				);

				overlayMousemoveEventUnlisten
					= this._renderer.listen(
						oRef.overlayElement,
						'mousemove',
						() => {
							tooltipRef.isOverlayHover = true;
						}
					);
				overlayMouseleaveEventUnlisten
					= this._renderer.listen(
						oRef.overlayElement,
						'mouseleave',
						() => {
							tooltipRef.isOverlayHover = false;

							if ( tooltipRef.isCloseDisabled ) {
								return;
							}

							tooltipRef.close();
						}
					);
			},
			onDetached: (
				oRef: OverlayRef
			) => {
				onDetached?.( oRef );

				tooltipRef.isOpened = false;

				closed$.next();

				opened$.complete();
				closed$.complete();

				resizeObserver.disconnect();

				overlayMousemoveEventUnlisten();
				overlayMouseleaveEventUnlisten();
			},
		};

		const overlayRef: OverlayRef
			= this.createOverlay(
				config,
				callbacks
			);
		const opened$: ReplaySubject<void>
			= new ReplaySubject<void>();
		const closed$: ReplaySubject<void>
			= new ReplaySubject<void>();
		const tooltipRef: CUBTooltipRef
			= {
				isOpened: false,
				isCloseDisabled:
					config.disableClose,
				isOverlayHover: false,
				origin,
				config,
				overlayRef,
				close: () =>
					this.close( tooltipRef ),
				enableClose: () =>
					this.enableClose( tooltipRef ),
				disableClose: () =>
					this.disableClose( tooltipRef ),
				setMessage: (
					_message: string
						| TemplateRef<any>
				) => this.setMessage(
					tooltipRef,
					_message
				),
				updateConfig: (
					_config?: CUBTooltipConfig
				) => this.updateConfig(
					tooltipRef,
					_config
				),
				updatePosition: (
					positionStrategy?:
						CUBTooltipPositionStrategy
				) => this.updatePosition(
					tooltipRef,
					positionStrategy
				),
				updateSize: (
					sizeConfig?:
						CUBTooltipSizeConfig
				) => this.updateSize(
					tooltipRef,
					sizeConfig
				),
				afterOpened: () => opened$,
				afterClosed: () => closed$,
			} as CUBTooltipRef;
		const instance: CUBTooltipComponent
			= tooltipRef.instance
			= overlayRef
			.attach(
				new ComponentPortal(
					CUBTooltipComponent,
					config.viewContainerRef
				)
			)
			.instance as CUBTooltipComponent;

		instance.message = message;
		instance.context = context;
		instance.type = config.type;

		return tooltipRef;
	}

	/**
	 * @param {CUBTooltipRef} tooltipRef
	 * @return {void}
	 */
	public close(
		tooltipRef: CUBTooltipRef
	) {
		tooltipRef
		.overlayRef
		.dispose();
	}

	/**
	 * @param {CUBTooltipRef} tooltip
	 * @return {void}
	 */
	public enableClose(
		tooltip: CUBTooltipRef
	) {
		tooltip.isCloseDisabled = false;
	}

	/**
	 * @param {CUBTooltipRef} tooltip
	 * @return {void}
	 */
	public disableClose(
		tooltip: CUBTooltipRef
	) {
		tooltip.isCloseDisabled = true;
	}

	/**
	 * @param {CUBTooltipRef} tooltipRef
	 * @param {string | TemplateRef<any>} message
	 * @return {void}
	 */
	public setMessage(
		tooltipRef: CUBTooltipRef,
		message:
			string | TemplateRef<any>
	) {
		tooltipRef
		.instance
		.message = message;
	}

	/**
	 * @param {CUBTooltipRef} tooltipRef
	 * @param {CUBTooltipConfig} config
	 * @return {void}
	 */
	public updateConfig(
		tooltipRef: CUBTooltipRef,
		config: CUBTooltipConfig
	) {
		tooltipRef.config = {
			...tooltipRef.config,
			...config,
		};

		tooltipRef.updatePosition(
			this.createPositionStrategy(
				tooltipRef.config
			)
		);
		tooltipRef.updateSize(
			tooltipRef.config
		);
	}

	/**
	 * @param {CUBTooltipRef | any} tooltipRef
	 * @param {CUBTooltipPositionStrategy=} positionStrategy
	 * @return {void}
	 */
	public override updatePosition(
		tooltipRef:
			CUBTooltipRef | any,
		positionStrategy?:
			CUBTooltipPositionStrategy
	) {
		super.updatePosition(
			tooltipRef.overlayRef,
			positionStrategy
		);
	}

	/**
	 * @param {CUBTooltipRef | any} tooltipRef
	 * @param {CUBTooltipSizeConfig=} sizeConfig
	 * @return {void}
	 */
	public override updateSize(
		tooltipRef:
			CUBTooltipRef | any,
		sizeConfig?:
			CUBTooltipSizeConfig
	) {
		super.updateSize(
			tooltipRef.overlayRef,
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
			'cub-overlay-tooltip-pane',

			...coerceArray( config.panelClass ),
		];

		config = super.createConfig({
			position: 'above',

			...config,

			panelClass,
		});

		config.stacking = false;
		config.autoFocus = false;
		config.restoreFocus = false;

		return config;
	}

}
