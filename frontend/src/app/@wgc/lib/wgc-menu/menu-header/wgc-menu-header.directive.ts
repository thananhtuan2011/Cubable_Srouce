import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcMenuHeader]', exportAs: 'wgcMenuHeader' })
export class WGCMenuHeaderDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
