import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubExpansionPanelContent]',
	exportAs: 'cubExpansionPanelContent',
})
export class CUBExpansionPanelContentDirective {

	public templateRef: TemplateRef<any> = inject( TemplateRef );

}
