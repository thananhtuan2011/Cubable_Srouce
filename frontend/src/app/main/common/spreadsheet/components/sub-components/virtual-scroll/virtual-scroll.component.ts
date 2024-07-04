import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	NgZone,
	OnDestroy,
	Output,
	QueryList,
	Renderer2,
	ViewChild
} from '@angular/core';
import {
	CdkDrag,
	CdkDropList,
	Point
} from '@angular/cdk/drag-drop';
import {
	CdkVirtualScrollableElement
} from '@angular/cdk/scrolling';
import {
	animationFrameScheduler,
	interval,
	Subject
} from 'rxjs';
import {
	takeUntil
} from 'rxjs/operators';
import ResizeObserver
	from 'resize-observer-polyfill';

import {
	Debounce,
	DetectScrollDirective,
	ScrollEvent,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBScrollBarDirective
} from '@cub/material/scroll-bar';

enum ScrollDirection {
	Horizontal = 1,
	Vertical,
}

@Unsubscriber()
@Component({
	selector: 'virtual-scroll, [virtualScroll]',
	templateUrl: './virtual-scroll.pug',
	styleUrls: [ './virtual-scroll.scss' ],
	host: { class: 'virtual-scroll' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollComponent implements AfterContentInit, OnDestroy {

	@ViewChild( DetectScrollDirective, { static: true } )
	public scroller: DetectScrollDirective;
	@ViewChild( CUBScrollBarDirective, { static: true } )
	public scrollBar: CUBScrollBarDirective;

	@ContentChild( CdkVirtualScrollableElement, { static: true } )
	public scrollableElement: CdkVirtualScrollableElement;
	@ContentChildren( CdkDrag, { descendants: true } )
	public cdkDragList: QueryList<CdkDrag>;

	@Input() public horizontalTrackOffset: Point;
	@Input() public verticalTrackOffset: Point;

	@Output() public scrolling: EventEmitter<ScrollEvent>
		= new EventEmitter<ScrollEvent>();

	public isScrolling: boolean;

	// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/naming-convention
	protected readonly ScrollDirection = ScrollDirection;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _ngZone: NgZone
		= inject( NgZone );
	private readonly _renderer: Renderer2
		= inject( Renderer2 );
	private readonly _resizeObserver: ResizeObserver
		= new ResizeObserver( this.detectChanges.bind( this ) );

	private _currentPos: {
		scrollLeft: number;
		scrollTop: number;
		mouseX: number;
		mouseY: number;
		dir: ScrollDirection;
	};

	@HostBinding( 'class.virtual-scroll--scrolling' )
	get classScrolling(): boolean {
		return this.isScrolling
			|| !!this._currentPos;
	}

	get scrollableNativeElement(): HTMLElement {
		return this.scrollableElement
		.getElementRef()
		.nativeElement;
	}

	get viewportOffsetLeft(): number {
		return this.scrollableNativeElement.offsetLeft;
	}
	get viewportOffsetTop(): number {
		return this.scrollableNativeElement.offsetTop;
	}
	get viewportWidth(): number {
		return this.scrollableNativeElement.clientWidth;
	}
	get viewportHeight(): number {
		return this.scrollableNativeElement.clientHeight;
	}
	get viewportScrollWidth(): number {
		return this.scrollableNativeElement.scrollWidth;
	}
	get viewportScrollHeight(): number {
		return this.scrollableNativeElement.scrollHeight;
	}

	get horizontalScrollRatio(): number {
		return this.viewportScrollWidth
			? this.viewportWidth
				/ this.viewportScrollWidth
			: 0;
	}
	get horizontalTrackOffsetX(): number {
		return this.horizontalTrackOffset?.x || 0;
	}
	get horizontalTrackOffsetY(): number {
		return this.horizontalTrackOffset?.y || 0;
	}
	get horizontalTrackSize(): number {
		return this.viewportWidth
			- this.horizontalTrackOffsetX;
	}
	get horizontalThumbOffset(): number {
		return this.viewportScrollWidth
			? ( this.scrollBar.scrollLeft * 100 )
				/ this.viewportScrollWidth
			: 0;
	}
	get horizontalThumbSize(): number {
		return this.horizontalScrollRatio * 100;
	}

	get verticalScrollRatio(): number {
		return this.viewportScrollHeight
			? this.viewportHeight
				/ this.viewportScrollHeight
			: 0;
	}
	get verticalTrackOffsetX(): number {
		return this.verticalTrackOffset?.x || 0;
	}
	get verticalTrackOffsetY(): number {
		return this.verticalTrackOffset?.y || 0;
	}
	get verticalTrackSize(): number {
		return this.viewportHeight
			- this.verticalTrackOffsetY;
	}
	get verticalThumbOffset(): number {
		return this.viewportScrollHeight
			? ( this.scrollBar.scrollTop * 100 )
				/ this.viewportScrollHeight
			: 0;
	}
	get verticalThumbSize(): number {
		return this.verticalScrollRatio * 100;
	}

	ngAfterContentInit() {
		this._resizeObserver.observe(
			this.scrollableNativeElement
		);

		this.cdkDragList.changes
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( list: QueryList<CdkDrag> ) => {
			list.forEach(( item: CdkDrag ) => {
				item._dragRef.beforeStarted
				.pipe(
					takeUntil( this.cdkDragList.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(() => {
					const cdkDropList: CdkDropList
						= item.dropContainer;

					if ( !cdkDropList ) return;

					cdkDropList._dropListRef.element
						= this.scrollBar.nativeElement;
					cdkDropList.element
						= this.scrollBar;
				});
			});
		});
	}

	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @param {ScrollToOptions} options
	 * @return {void}
	 */
	public scrollBy(
		options: ScrollToOptions
	) {
		this.scrollableNativeElement
		.scrollBy({ top: options.top });
		this.scrollBar
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
		const maxScrollLeft: number
			= this.viewportScrollWidth
				- ( this.horizontalThumbSize / 100 )
				* this.viewportScrollWidth;
		const maxScrollTop: number
			= this.viewportScrollHeight
				- ( this.verticalThumbSize / 100 )
				* this.viewportScrollHeight;
		let { left, top }: ScrollToOptions
			= options;

		if ( left < 0 ) {
			left = 0;
		} else if ( left > maxScrollLeft ) {
			left = maxScrollLeft;
		}

		if ( top < 0 ) {
			top = 0;
		} else if ( top > maxScrollTop ) {
			top = maxScrollTop;
		}

		this.scrollableElement
		.scrollTo({ top });
		this.scrollBar
		.scrollTo( options, duration );
	}

	/**
	 * @param {Point} pointerPosition
	 * @return {Point}
	 */
	public measurePointerOffset(
		pointerPosition: Point
	): Point {
		const {
			left,
			top,
			width,
			height,
		}: DOMRect = this.scrollableNativeElement
		.getBoundingClientRect();
		const { x, y }: Point = pointerPosition;
		let offsetX: number = null;
		let offsetY: number = null;

		if ( x >= left
			&& x <= left + width ) {
			offsetX = x
				- left
				+ this.scrollBar.scrollLeft;
		}

		if ( y >= top
			&& y <= top + height ) {
			offsetY = y
				- top
				+ this.scrollBar.scrollTop;
		}

		return { x: offsetX, y: offsetY };
	}

	@HostListener( 'mousedown' )
	protected onMousedown() {
		this._ngZone.runOutsideAngular(() => {
			const {
				left,
				top,
			}: DOMRect = this.scrollableNativeElement
			.getBoundingClientRect();
			const autoScrollStep: number = 10;
			const stopScrollTimers: Subject<void>
				= new Subject<void>();

			const unlisten1: () => void
				= this._renderer.listen(
					document,
					'mousemove',
					( e: MouseEvent ) => {
						stopScrollTimers.next();

						let autoScrollStepX: number;
						let autoScrollStepY: number;

						if ( e.pageX
							> left + this.viewportWidth ) {
							autoScrollStepX = autoScrollStep;
						} else if ( e.pageX
							< left + this.horizontalTrackOffsetX ) {
							autoScrollStepX = -autoScrollStep;
						}

						if ( e.pageY
							> top + this.viewportHeight ) {
							autoScrollStepY = autoScrollStep;
						} else if ( e.pageY
							< top + this.verticalTrackOffsetY ) {
							autoScrollStepY = -autoScrollStep;
						}

						if ( !autoScrollStepX
							&& !autoScrollStepY ) {
							return;
						}

						interval(
							0,
							animationFrameScheduler
						)
						.pipe(
							takeUntil( stopScrollTimers ),
							untilCmpDestroyed( this )
						)
						.subscribe(() => {
							this.scrollBy({
								left: autoScrollStepX,
								top: autoScrollStepY,
							});
						});
					}
				);

			const unlisten2: () => void
				= this._renderer.listen(
					document,
					'mouseup',
					() => {
						stopScrollTimers.next();

						unlisten1();
						unlisten2();
					}
				);
		});
	}

	@HostListener( 'wheel', [ '$event' ] )
	protected onWheel( e: WheelEvent ) {
		e.stopPropagation();
		e.preventDefault();

		const left: number
			= this.scrollBar.scrollLeft
				+ e.deltaX;
		const top: number
			= this.scrollBar.scrollTop
				+ e.deltaY;

		this.scrollTo({ left, top });
	}

	/**
	 * @param {MouseEvent} e
	 * @param {ScrollDirection} dir
	 * @return {void}
	 */
	protected onTrackClicked(
		e: MouseEvent,
		dir: ScrollDirection
	) {
		e.stopPropagation();
		e.preventDefault();

		switch ( dir ) {
			case ScrollDirection.Horizontal:
				this.scrollTo({
					left: ( ( e.clientX - this.horizontalTrackOffsetX )
							/ this.horizontalTrackSize )
						* ( this.viewportScrollWidth
							- this.viewportWidth ),
				});
				break;
			case ScrollDirection.Vertical:
				this.scrollTo({
					top: ( ( e.clientY - this.verticalTrackOffsetY )
							/ this.verticalTrackSize )
						* ( this.viewportScrollHeight
							- this.viewportHeight ),
				});
				break;
		}
	}

	/**
	 * @param {MouseEvent} e
	 * @param {ScrollDirection} dir
	 * @return {void}
	 */
	protected onThumbMousedown(
		e: MouseEvent,
		dir: ScrollDirection
	) {
		e.stopPropagation();
		e.preventDefault();

		this._ngZone.runOutsideAngular(() => {
			this._currentPos = {
				// The current scroll
				scrollLeft: this.scrollBar.scrollLeft,
				scrollTop: this.scrollBar.scrollTop,
				// Get the current mouse position
				mouseX: e.clientX,
				mouseY: e.clientY,
				// The current dir
				dir,
			};

			const unlisten1: () => void
				= this._renderer.listen(
					document,
					'mousemove',
					( ev: MouseEvent ) => {
						ev.stopPropagation();
						ev.preventDefault();

						if ( !this._currentPos ) return;

						switch ( this._currentPos.dir ) {
							case ScrollDirection.Horizontal:
								const dx: number = ev.clientX
									- this._currentPos.mouseX;

								this.scrollTo({
									left: this._currentPos.scrollLeft
										+ dx
										/ this.horizontalScrollRatio,
								});
								break;
							case ScrollDirection.Vertical:
								const dy: number = ev.clientY
									- this._currentPos.mouseY;

								this.scrollTo({
									top: this._currentPos.scrollTop
										+ dy
										/ this.verticalScrollRatio,
								});
								break;
						}
					}
				);

			const unlisten2: () => void
				= this._renderer.listen(
					document,
					'mouseup',
					( ev: MouseEvent ) => {
						ev.stopPropagation();
						ev.preventDefault();

						this._currentPos = null;

						unlisten1();
						unlisten2();
					}
				);
		});
	}

	/**
	 * @param {ScrollEvent} e
	 * @return {void}
	 */
	protected onScrolling( e: ScrollEvent ) {
		this.isScrolling = true;

		this._markStopScrolling();

		this.scrollableElement
		.scrollTo({ top: e.scrollTop });

		this.scrolling.emit( e );
	}

	/**
	 * @return {void}
	 */
	@Debounce( 17 ) // 60fps
	private _markStopScrolling() {
		this.isScrolling = false;

		this.markForCheck();
	}

}
