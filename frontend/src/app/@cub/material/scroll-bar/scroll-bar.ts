import {
	AfterViewInit,
	ChangeDetectorRef,
	Directive,
	ElementRef,
	EventEmitter,
	HostBinding,
	inject,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import ResizeObserver
	from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	DetectScrollDirective
} from 'angular-core';

export enum CUBScrollBarMode {
	Auto = 'auto',
	Scroll = 'scroll',
	Visible = 'visible',
}

@Directive()
export class CUBScrollBar
	extends DetectScrollDirective
	implements AfterViewInit, OnInit, OnDestroy {

	@Input() @CoerceBoolean()
	public deepScroll: boolean;
	@Input() @CoerceBoolean()
	public suppress: boolean;
	@Input() @CoerceBoolean()
	public suppressX: boolean;
	@Input() @CoerceBoolean()
	public suppressY: boolean;
	@HostBinding( 'style.--scroll-bar-mode' )
	@Input() @DefaultValue()
	public mode: CUBScrollBarMode = CUBScrollBarMode.Auto;

	@Output() public init: EventEmitter<CUBScrollBar>
		= new EventEmitter<CUBScrollBar>();

	public readonly elementRef: ElementRef
		= inject( ElementRef );

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly ngZone: NgZone
		= inject( NgZone );

	@HostBinding( 'attr.scrollBar' )
	protected readonly attrScrollBar: boolean = true;

	private readonly _resizeObserver: ResizeObserver
		= new ResizeObserver(
			() => this.cdRef.markForCheck()
		);

	@HostBinding( 'attr.deepScroll' )
	get attrDeepScroll(): boolean {
		return this.deepScroll || undefined;
	}

	/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
	@HostBinding( 'attr.suppressX' )
	get attrSuppressX(): boolean {
		return this.suppress === true
			|| this.suppressX === true;
	}

	@HostBinding( 'attr.suppressY' )
	get attrSuppressY(): boolean {
		return this.suppress === true
			|| this.suppressY === true;
	}
	/* eslint-enable @typescript-eslint/no-unnecessary-boolean-literal-compare */

	@HostBinding( 'attr.scrollableX' )
	get attrScrollableX(): boolean {
		return !this.suppress
			&& !this.suppressX
			&& this.scrollableX;
	}

	@HostBinding( 'attr.scrollableY' )
	get attrScrollableY(): boolean {
		return !this.suppress
			&& !this.suppressY
			&& this.scrollableY;
	}

	get nativeElement(): HTMLElement {
		return this.elementRef.nativeElement;
	}

	get viewportWidth(): number {
		return this.nativeElement.clientWidth;
	}
	get viewportHeight(): number {
		return this.nativeElement.clientHeight;
	}

	get scrollWidth(): number {
		return this.nativeElement.scrollWidth;
	}
	get scrollHeight(): number {
		return this.nativeElement.scrollHeight;
	}
	get scrollLeft(): number {
		return this.nativeElement.scrollLeft;
	}
	get scrollTop(): number {
		return this.nativeElement.scrollTop;
	}

	ngOnInit() {
		this.init.emit( this );
	}

	ngAfterViewInit() {
		this._resizeObserver
		.observe( this.nativeElement );
	}

	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * @return {void}
	 */
	public reset() {
		setTimeout(() => {
			this.nativeElement
			.scrollTo( 0, 0 );
		});
	}

	/**
	 * @param {ScrollToOptions} options
	 * @return {void}
	 */
	public scrollBy(
		options: ScrollToOptions
	) {
		this.nativeElement
		.scrollBy( options );
	}

	/**
	 * @param {ScrollToOptions} options
	 * @param {number=} duration
	 * @return {void}
	 */
	public scrollTo(
		options: ScrollToOptions,
		duration?: number
	) {
		if ( _.isFinite( duration ) ) {
			this._animateScrollTo(
				options.left,
				options.top,
				duration,
				this.nativeElement
			);
			return;
		}

		this.nativeElement
		.scrollTo( options );
	}

	/**
	 * @param {number=} duration
	 * @return {void}
	 */
	public scrollToLeft(
		duration?: number
	) {
		this.scrollTo(
			{ left: 0 },
			duration
		);
	}

	/**
	 * @param {number=} duration
	 * @return {void}
	 */
	public scrollToRight(
		duration?: number
	) {
		this.scrollTo(
			{
				left: this.scrollWidth
					+ this.viewportWidth,
			},
			duration
		);
	}

	/**
	 * @param {number=} duration
	 * @return {void}
	 */
	public scrollToTop(
		duration?: number
	) {
		this.scrollTo(
			{ top: 0 },
			duration
		);
	}

	/**
	 * @param {number=} duration
	 * @return {void}
	 */
	public scrollToBottom(
		duration?: number
	) {
		this.scrollTo(
			{
				top: this.scrollHeight
					+ this.viewportHeight,
			},
			duration
		);
	}

	/**
	 * @param {number} scrollLeft
	 * @param {number} scrollTop
	 * @param {number=} duration
	 * @param {Element=} element
	 * @return {void}
	 */
	private _animateScrollTo(
		scrollLeft: number,
		scrollTop: number,
		duration: number = 0,
		element: Element = document.scrollingElement
	) {
		if ( element.scrollLeft !== scrollLeft ) {
			const cosXParameter: number
				= ( element.scrollLeft - scrollLeft ) / 2;
			let scrollXCount: number = 0;
			let oldTimestampX: number;

			// @ts-ignore
			function stepX( newTimestamp: number ) {
				if ( oldTimestampX !== undefined ) {
					// If duration is 0 scrollCount will be Infinity
					scrollXCount += Math.PI
						* ( newTimestamp - oldTimestampX )
						/ duration;

					if ( scrollXCount >= Math.PI ) {
						return element.scrollLeft = scrollLeft;
					}

					element.scrollLeft = cosXParameter
						+ scrollLeft
						+ cosXParameter
						* Math.cos( scrollXCount );
				}

				oldTimestampX = newTimestamp;

				window.requestAnimationFrame( stepX );
			}

			window.requestAnimationFrame( stepX );
		}

		if ( element.scrollTop !== scrollTop ) {
			const cosYParameter: number
				= ( element.scrollTop - scrollTop ) / 2;
			let scrollYCount: number = 0;
			let oldTimestampY: number;

			// @ts-ignore
			function stepY( newTimestamp: number ) {
				if ( oldTimestampY !== undefined ) {
					// If duration is 0 scrollCount will be Infinity
					scrollYCount += Math.PI
						* ( newTimestamp - oldTimestampY )
						/ duration;

					if ( scrollYCount >= Math.PI ) {
						return element.scrollTop = scrollTop;
					}

					element.scrollTop = cosYParameter
						+ scrollTop
						+ cosYParameter
						* Math.cos( scrollYCount );
				}

				oldTimestampY = newTimestamp;

				window.requestAnimationFrame( stepY );
			}

			window.requestAnimationFrame( stepY );
		}
	}

}
