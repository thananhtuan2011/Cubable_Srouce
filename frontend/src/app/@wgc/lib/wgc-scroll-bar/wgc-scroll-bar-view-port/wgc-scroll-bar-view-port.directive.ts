import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[wgcScrollBarViewPort]', exportAs: 'wgcScrollBarViewPort' })
export class WGCScrollBarViewPortDirective {

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

}
