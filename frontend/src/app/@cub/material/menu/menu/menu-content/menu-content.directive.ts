import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubMenuContent]',
	exportAs: 'cubMenuContent',
})
export class CUBMenuContentDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
