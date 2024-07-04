import {
	Directive, ElementRef, NgZone,
	ChangeDetectorRef, Input, Output,
	EventEmitter
} from '@angular/core';
import _ from 'lodash';

@Directive({ selector: '[wgcScrollBarViewPortItem]', exportAs: 'wgcScrollBarViewPortItem' })
export class WGCScrollBarViewPortItemDirective {

	@Input() public viewPortOffset: number[];

	@Output() public inViewPort: EventEmitter<boolean> = new EventEmitter<boolean>();

	public isInViewPort: boolean;

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {NgZone} _ngZone
	 */
	constructor( public elementRef: ElementRef, private _cdRef: ChangeDetectorRef, private _ngZone: NgZone ) {}

	/**
	 * @param {ElementRef} parent
	 * @return {void}
	 */
	public checkInViewPort( parent: HTMLElement = document.documentElement ) {
		this._ngZone.runOutsideAngular( () => {
			const bounding: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
			const height: number = this.elementRef.nativeElement.clientHeight;
			const width: number = this.elementRef.nativeElement.clientWidth;
			const offsetWidth: number = _.get( this.viewPortOffset, 0 ) || 0;
			const offsetHeight: number = _.get( this.viewPortOffset, 1 ) || 0;

			this.isInViewPort = bounding.top >= -height - offsetHeight
				&& bounding.left >= -width - offsetWidth
				&& bounding.bottom <= parent.clientHeight + height + offsetHeight
				&& bounding.right <= parent.clientWidth + width + offsetWidth;

			this.inViewPort.emit( this.isInViewPort );
			this._cdRef.markForCheck();
		} );
	}

}
