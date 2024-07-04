import {
	Directive,
	inject,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubDrawerLazy]',
	exportAs: 'cubDrawerLazy',
})
export class CUBDrawerLazyDirective {

	public readonly templateRef: TemplateRef<any> = inject( TemplateRef );

}
