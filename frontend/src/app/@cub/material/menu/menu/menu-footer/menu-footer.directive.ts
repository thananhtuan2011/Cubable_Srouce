import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubMenuFooter]',
	exportAs: 'cubMenuFooter',
})
export class CUBMenuFooterDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
