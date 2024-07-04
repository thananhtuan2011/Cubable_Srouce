import {
	Directive, QueryList, ElementRef,
	Input, AfterViewInit, ChangeDetectorRef,
	SimpleChanges, OnChanges, OnDestroy,
	ContentChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import {
	tap, switchMap, skipWhile,
	startWith, map
} from 'rxjs/operators';
import _ from 'lodash';

import { DefaultValue, CoerceNumber, Unsubscriber, untilCmpDestroyed } from '@core';

const UNAVAILABLE_SIZE: number = 70;

@Unsubscriber()
@Directive({ selector: '[wgcBlockTruncate]', exportAs: 'wgcBlockTruncate' })
export class WGCBlockTruncateDirective implements OnChanges, OnDestroy, AfterViewInit {

	@ContentChildren( 'block' ) public blocks: QueryList<ElementRef>;

	@Input() @DefaultValue() @CoerceNumber() public limit: number = 1;
	@Input() @DefaultValue() @CoerceNumber() public maximum: number = 10;
	@Input() @CoerceNumber() public length: number;
	@Input() public parent: HTMLElement;

	public maxDisplay: number = 0;

	private _currentParentWidth: number;
	private _isRendering: boolean;
	private _render$: Subject<number>;
	private _resizeObserver: ResizeObserver;
	private _markAsDoneDebounce: ReturnType<typeof _.debounce> = _.debounce( this.markAsDone.bind( this ) );

	get moreDisplay(): number {
		return this.length - this.maxDisplay;
	}

	get isFixedLimit(): boolean {
		return this.limit >= 1;
	}

	get isTruncated(): boolean {
		return this.maxDisplay > 0 && this.moreDisplay > 0;
	}

	get ele(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	get parentEle(): HTMLElement {
		return this.parent || this.ele.parentElement;
	}

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( public _elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.length ) return;

		changes.length.firstChange
			? this.setMaxDisplay( this.limit || 1 )
			: this._render$?.next( this.parentEle?.clientWidth );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		if ( this.isFixedLimit ) return;

		this._render$ = new Subject<number>();

		this._render$
		.pipe(
			tap( () => this._isRendering = true ),
			tap( () => this.ele.style.opacity = '0' ),
			tap( () => this.setMaxDisplay( this.length ) ),
			switchMap( ( parentWidth: number ) => this.blocks.changes.pipe(
				startWith( this.blocks ),
				skipWhile( ( blocks: QueryList<ElementRef> ) => blocks.length !== this.maxDisplay ),
				map( () => parentWidth )
			) ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( parentWidth: number ) => {
			let maxDisplay: number = 1;

			if ( parentWidth && this.length > 1 ) {
				let offsetWidth: number = 0;
				let i: number = 1;

				for ( const block of this.blocks ) {
					const element: HTMLElement = block.nativeElement;
					const { width }: DOMRect = element.getBoundingClientRect();
					const { marginLeft, marginRight }: CSSStyleDeclaration = getComputedStyle( element );

					offsetWidth += width + parseFloat( marginLeft ) + parseFloat( marginRight );

					if ( Math.round( offsetWidth ) > parentWidth - UNAVAILABLE_SIZE ) break;

					maxDisplay = i++;
				}
			}

			this.setMaxDisplay( maxDisplay );
			this._markAsDoneDebounce( parentWidth );
		} );

		/*
		Read more about the resize observer here: https://developers.google.com/web/updates/2016/10/resizeobserver
		Basicaly, what we do is that we subscribe to size events on the overlay.
		Currently we only get one event, (then we disconnet the resize observer).
		But then we simply calculate if we need to improve the layout.
		 */
		this._resizeObserver = new ResizeObserver( _.throttle( () => {
			if ( this._isRendering ) return;

			const parentWidth: number = this.parentEle.clientWidth;

			if ( !parentWidth
				|| ( parentWidth === this._currentParentWidth
					&& parentWidth >= this.ele.clientWidth ) ) {
				return;
			}

			this._render$.next( parentWidth );
		}, 200 ) );

		// Element for which to observe height and width
		this._resizeObserver.observe( this.parentEle );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._render$?.complete();
		this._resizeObserver?.disconnect();
	}

	/**
	 * @param {number} maxDisplay
	 * @return {void}
	 */
	protected setMaxDisplay( maxDisplay: number ) {
		this.maxDisplay = ( maxDisplay < this.maximum ? maxDisplay : this.maximum ) || this.length;

		this._cdRef.markForCheck();
	}

	/**
	 * @param {number} parentWidth
	 * @return {void}
	 */
	protected markAsDone( parentWidth: number ) {
		this._isRendering = false;
		this._currentParentWidth = parentWidth;
		this.ele.style.opacity = null;

		this._cdRef.markForCheck();
	}

}
