import {
	Component, ViewEncapsulation, ContentChildren,
	QueryList, Input, ElementRef,
	ViewChild, Output, EventEmitter,
	ViewChildren, OnChanges, SimpleChanges,
	AfterContentInit, AfterViewInit, OnDestroy,
	ChangeDetectionStrategy, HostBinding, ChangeDetectorRef
} from '@angular/core';
import { Observable, merge } from 'rxjs';
import { startWith, takeUntil, switchMap } from 'rxjs/operators';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	DetectScrollDirective, Unsubscriber, CoerceBoolean,
	CoerceNumber, DefaultValue, CoerceCssPixel,
	untilCmpDestroyed
} from '@core';
import { WGCScrollBarDirective, IWGCScrollBarMode } from '../../wgc-scroll-bar';
import { WGCTabComponent } from '../tab/wgc-tab.component';

export interface WGCIBeforeTabChangeEvent {
	tabGroup: WGCTabGroupComponent;
	tabIndex: number;
}

export type WGCITabAlignment = 'left' | 'right' | 'center';

@Unsubscriber()
@Component({
	selector		: 'wgc-tab-group',
	templateUrl		: './wgc-tab-group.pug',
	styleUrls		: [ './wgc-tab-group.scss' ],
	host			: { class: 'wgc-tab-group' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTabGroupComponent implements OnChanges, OnDestroy, AfterContentInit, AfterViewInit {

	@HostBinding( 'style.--tab-group-header-height' )
	get styleHeaderHeight(): string { return this.headerHeight; }

	@HostBinding( 'style.--tab-group-content-padding-top' )
	get styleContentPaddingTop(): string { return this.contentPaddingTop || this.contentPaddingVertical; }

	@HostBinding( 'style.--tab-group-content-padding-bottom' )
	get styleContentPaddingBottom(): string { return this.contentPaddingBottom || this.contentPaddingVertical; }

	@HostBinding( 'style.--tab-group-content-padding-left' )
	get styleContentPaddingLeft(): string { return this.contentPaddingLeft || this.contentPaddingHorizontal; }

	@HostBinding( 'style.--tab-group-content-padding-right' )
	get styleContentPaddingRight(): string { return this.contentPaddingRight || this.contentPaddingHorizontal; }

	@HostBinding( 'class.wgc-tab-group--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@HostBinding( 'class.wgc-tab-group--left' )
	get classLeft(): boolean { return this.alignment === 'left'; }

	@HostBinding( 'class.wgc-tab-group--right' )
	get classRight(): boolean { return this.alignment === 'right'; }

	@HostBinding( 'class.wgc-tab-group--center' )
	get classCenter(): boolean { return this.alignment === 'center'; }

	@ViewChild( 'tabGroupHeaderScroller' ) public tabGroupHeaderScroller: DetectScrollDirective;
	@ViewChild( 'tabGroupHeaderScrollBar' ) public tabGroupHeaderScrollBar: WGCScrollBarDirective;
	@ViewChild( 'tabGroupContentScroller' ) public tabGroupContentScroller: DetectScrollDirective;
	@ViewChild( 'tabGroupContentScrollBar' ) public tabGroupContentScrollBar: WGCScrollBarDirective;
	@ViewChild( 'tabGroupHeader' ) public tabGroupHeader: ElementRef;
	@ViewChild( 'tabGroupContent' ) public tabGroupContent: ElementRef;
	@ViewChild( 'tabInkBar' ) public tabInkBar: ElementRef;
	@ViewChildren( 'tabHeader' ) public tabHeaderList: QueryList<ElementRef>;

	@ContentChildren( WGCTabComponent, { descendants: true } ) public tabItems: QueryList<WGCTabComponent>;

	@Input() @CoerceCssPixel() public headerHeight: string;
	@Input() @CoerceCssPixel() public contentPaddingVertical: string;
	@Input() @CoerceCssPixel() public contentPaddingHorizontal: string;
	@Input() @CoerceCssPixel() public contentPaddingTop: string;
	@Input() @CoerceCssPixel() public contentPaddingBottom: string;
	@Input() @CoerceCssPixel() public contentPaddingLeft: string;
	@Input() @CoerceCssPixel() public contentPaddingRight: string;
	@Input() @DefaultValue() @CoerceNumber() public selectedIndex: number = 0;
	@Input() @DefaultValue() @CoerceBoolean() public hasScrollBar: boolean = true;
	@Input() @CoerceBoolean() public stretch: boolean;
	@Input() @CoerceBoolean() public stretchTab: boolean;
	@Input() @CoerceBoolean() public headerVerticalDivider: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public headerHorizontalDivider: boolean = true;
	@Input() @CoerceBoolean() public alwaysOnDisplay: boolean;
	@Input() @CoerceBoolean() public noTabContent: boolean;
	@Input() @DefaultValue() public alignment: WGCITabAlignment = 'left';
	@Input() public scrollBarMode: IWGCScrollBarMode;

	@Output() public selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();
	@Output() public tabChanged: EventEmitter<WGCTabComponent> = new EventEmitter<WGCTabComponent>();

	public items: WGCTabComponent[];

	private _tabHeaderItems: ElementRef<any>[];
	private _resizeObserver: ResizeObserver = new ResizeObserver( () => this._initInkBarThrottle( this.selectedIndex ) );
	private _initInkBarThrottle: ReturnType<typeof _.throttle>
		= _.throttle( this._initInkBar.bind( this ), 200, { leading: false } );

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.selectedIndex ) return;

		this.select( this.selectedIndex );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.tabHeaderList.changes
		.pipe(
			startWith( this.tabHeaderList ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<ElementRef<any>[]> ) => {
			this._tabHeaderItems = ( items as ObjectType )?._results;

			this._initInkBarThrottle( this.selectedIndex );
		} );

		this.select( this.selectedIndex );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.tabItems.changes
		.pipe(
			startWith( this.tabItems ),
			switchMap( ( items: QueryList<WGCTabComponent> ) => {
				const obs: Observable<any>[] = [];

				this.items = _.map( ( items as ObjectType )?._results, ( item: WGCTabComponent ) => {
					obs.push(
						item.changes$
						.pipe( takeUntil( this.tabItems.changes ) )
					);

					return item;
				} );

				this._cdRef.markForCheck();

				return merge( ...obs );
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( () => {
			this._initInkBarThrottle( this.selectedIndex );
			this._cdRef.markForCheck();
		} );

		// Element for which to observe height and width
		this._resizeObserver.observe( this._elementRef.nativeElement );
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public select( index: number ) {
		if ( !_.isFinite( index ) || !this.items?.length ) return;

		if ( this.selectedIndex !== index ) {
			this.selectedIndex = index;

			this.tabChanged.emit( this.items[ this.selectedIndex ] );
			this.selectedIndexChange.emit( this.selectedIndex );
		}

		this.tabGroupContentScrollBar?.reset();
		this._initInkBarThrottle( index );
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public scrollIntoElement( index: number ) {
		this._getSelectedTab( index )?.nativeElement.scrollIntoView({ inline: 'start', behavior: 'smooth' });
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	private _initInkBar( index: number ) {
		if ( !this.tabInkBar ) return;

		const selectedTab: ElementRef<any> = this._getSelectedTab( index );

		if ( !selectedTab ) return;

		const width: number = selectedTab.nativeElement.clientWidth || 0;
		const left: number = selectedTab.nativeElement.offsetLeft || 0;

		this.tabInkBar.nativeElement.style.width = `${width}px`;
		this.tabInkBar.nativeElement.style.left = `${left}px`;

		selectedTab.nativeElement.scrollIntoView({ block: 'center', inline: 'nearest' });
	}

	/**
	 * @param {number} index
	 * @return {ElementRef<any>}
	 */
	private _getSelectedTab( index: number ): ElementRef<any> {
		if ( !this._tabHeaderItems ) return;

		if ( index < 0 ) index = 0;
		else if ( index > this._tabHeaderItems.length - 1 ) index = this._tabHeaderItems.length - 1;

		return this._tabHeaderItems[ index ];
	}

}
