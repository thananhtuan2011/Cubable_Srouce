import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcMenuFooter]', exportAs: 'wgcMenuFooter' })
export class WGCMenuFooterDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
