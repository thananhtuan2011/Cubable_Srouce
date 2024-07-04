import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubRadioContent]',
	exportAs: 'cubRadioContent',
})
export class CUBRadioContentDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
