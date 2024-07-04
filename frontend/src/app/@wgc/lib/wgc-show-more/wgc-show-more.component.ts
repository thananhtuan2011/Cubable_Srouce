import {
	Component, ViewEncapsulation, Input,
	ElementRef, ViewChild, Output,
	EventEmitter, AfterViewInit, OnDestroy,
	NgZone, HostBinding, ChangeDetectorRef,
	ChangeDetectionStrategy
} from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';

import { CoerceCssPixel } from '@core';

@Component({
	selector		: 'wgc-show-more, [wgcShowMore]',
	templateUrl		: './wgc-show-more.pug',
	styleUrls		: [ './wgc-show-more.scss' ],
	host			: { class: 'wgc-show-more' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCShowMoreComponent implements AfterViewInit, OnDestroy {

	@HostBinding( 'style.--show-more-limit' )
	get styleLimit(): string { return !this.opened ? this.limit : undefined; }

	@HostBinding( 'class.wgc-show-more--hidden' )
	get classHidden(): boolean { return !this.opened && this.isHidden; }

	@ViewChild( 'showMoreContent' ) public showMoreContent: ElementRef<any>;

	@Input() @CoerceCssPixel() public limit: string;
	@Input() public opened: boolean;

	@Output() public openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	public isHidden: boolean = false;

	private _resizeObserver: ResizeObserver = new ResizeObserver( this._detect.bind( this ) );

	/**
	 * @constructor
	 * @param {NgZone} _ngZone
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _ngZone: NgZone, private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		// Element for which to observe height and width
		this._resizeObserver.observe( this.showMoreContent.nativeElement );

		// First detect
		this._detect();
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * @return {void}
	 */
	public toggle() {
		// fix: toggle too slow when component is re-render
		this._ngZone.run( () => {
			this.opened = !this.opened;

			this.openedChange.emit( this.opened );
		} );
	}

	/**
	 * @return {void}
	 */
	private _detect() {
		const element: HTMLElement = this.showMoreContent.nativeElement;

		if ( !element ) return;

		setTimeout( () => {
			this.isHidden = element.clientHeight > parseFloat( this.limit );

			this._cdRef.markForCheck();
		} );
	}

}
