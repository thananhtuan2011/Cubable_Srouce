import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubPopupHeader]',
	exportAs: 'cubPopupHeader',
})
export class CUBPopupHeaderDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
