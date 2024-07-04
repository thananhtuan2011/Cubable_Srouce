import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubMenuHeader]',
	exportAs: 'cubMenuHeader',
})
export class CUBMenuHeaderDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
