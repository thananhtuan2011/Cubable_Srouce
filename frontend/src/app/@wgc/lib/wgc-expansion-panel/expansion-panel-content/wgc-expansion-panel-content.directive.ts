import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[wgcExpansionPanelContent]', exportAs: 'wgcExpansionPanelContent' })
export class WGCExpansionPanelContentDirective {

	/**
	 * @constructor
	 * @param {TemplateRef} templateRef
	 */
	constructor( public templateRef: TemplateRef<any> ) {}

}
