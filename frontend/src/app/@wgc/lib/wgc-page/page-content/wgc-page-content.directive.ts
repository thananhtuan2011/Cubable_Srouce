import { Directive, ElementRef, Input } from '@angular/core';

import { CoerceCssPixel } from '@core';

@Directive({ selector: '[wgcPageContent]', exportAs: 'wgcPageContent' })
export class WGCPageContentDirective {

	@Input() @CoerceCssPixel() public paddingVertical: string;
	@Input() @CoerceCssPixel() public paddingHorizontal: string;
	@Input() @CoerceCssPixel() public paddingTop: string;
	@Input() @CoerceCssPixel() public paddingBottom: string;
	@Input() @CoerceCssPixel() public paddingLeft: string;
	@Input() @CoerceCssPixel() public paddingRight: string;

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

}
