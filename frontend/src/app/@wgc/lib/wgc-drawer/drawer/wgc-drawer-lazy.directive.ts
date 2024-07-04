import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcDrawerLazy]', exportAs: 'wgcDrawerLazy' })
export class WGCDrawerLazyDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
