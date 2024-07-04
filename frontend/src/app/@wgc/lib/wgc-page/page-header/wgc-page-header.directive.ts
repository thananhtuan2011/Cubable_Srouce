import { Directive, ElementRef, Input } from '@angular/core';

import { CoerceCssPixel, CoerceBoolean } from '@core';

@Directive({ selector: '[wgcPageHeader]', exportAs: 'wgcPageHeader' })
export class WGCPageHeaderDirective {

	@Input() @CoerceCssPixel() public paddingVertical: string;
	@Input() @CoerceCssPixel() public paddingHorizontal: string;
	@Input() @CoerceCssPixel() public paddingTop: string;
	@Input() @CoerceCssPixel() public paddingBottom: string;
	@Input() @CoerceCssPixel() public paddingLeft: string;
	@Input() @CoerceCssPixel() public paddingRight: string;
	@Input() @CoerceBoolean() public divider: boolean;

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

}
