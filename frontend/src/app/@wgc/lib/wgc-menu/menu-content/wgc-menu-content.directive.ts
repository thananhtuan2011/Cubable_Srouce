import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcMenuContent]', exportAs: 'wgcMenuContent' })
export class WGCMenuContentDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
