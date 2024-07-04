import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubTabHeader]',
	exportAs: 'cubTabHeader',
})
export class CUBTabHeaderDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
