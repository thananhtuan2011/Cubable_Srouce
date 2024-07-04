import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubPopupContent]',
	exportAs: 'cubPopupContent',
})
export class CUBPopupContentDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
