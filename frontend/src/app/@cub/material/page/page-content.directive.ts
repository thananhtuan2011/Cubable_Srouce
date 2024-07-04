import {
	Directive,
	ElementRef,
	inject
} from '@angular/core';

@Directive({
	selector: '[cubPageContent]',
	exportAs: 'cubPageContent',
})
export class CUBPageContentDirective {

	public readonly elementRef: ElementRef = inject( ElementRef );

	get width(): number {
		return this.elementRef.nativeElement.clientWidth;
	}

	get height(): number {
		return this.elementRef.nativeElement.clientHeight;
	}

}
