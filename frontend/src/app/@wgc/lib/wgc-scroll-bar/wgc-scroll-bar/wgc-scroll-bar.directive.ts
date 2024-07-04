import { Directive, ElementRef, NgZone, HostBinding } from '@angular/core';

import { Unsubscriber } from '@core';
import { WGCScrollBar } from './wgc-scroll-bar';

@Unsubscriber()
@Directive({ selector: '[wgcScrollBar]', exportAs: 'wgcScrollBar' })
export class WGCScrollBarDirective extends WGCScrollBar {

	@HostBinding( 'style.--scroll-bar-mode' )
	get styleMode(): string { return this.mode; }

	@HostBinding( 'attr.scrollBar' )
	get attrScrollBar(): boolean { return !this.suppress || undefined; }

	@HostBinding( 'attr.scrollBarSuppressX' )
	get attrScrollBarSuppressX(): boolean { return this.suppressScrollX || undefined; }

	@HostBinding( 'attr.scrollBarSuppressY' )
	get attrScrollBarSuppressY(): boolean { return this.suppressScrollY || undefined; }

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {NgZone} ngZone
	 */
	constructor( public elementRef: ElementRef, protected ngZone: NgZone ) {
		super();
	}

}
