import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubTabContent]',
	exportAs: 'cubTabContent',
})
export class CUBTabContentDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
