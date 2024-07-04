import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcTabContent]', exportAs: 'wgcTabContent' })
export class WGCTabContentDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
