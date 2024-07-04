import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubPopupFooter]',
	exportAs: 'cubPopupFooter',
})
export class CUBPopupFooterDirective {

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
