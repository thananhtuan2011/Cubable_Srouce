import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcTabHeader]', exportAs: 'wgcTabHeader' })
export class WGCTabHeaderDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
