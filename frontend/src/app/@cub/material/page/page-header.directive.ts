import {
	Directive,
	ElementRef,
	inject
} from '@angular/core';

@Directive({
	selector: '[cubPageHeader]',
	exportAs: 'cubPageHeader',
})
export class CUBPageHeaderDirective {

	public readonly elementRef: ElementRef = inject( ElementRef );

	get width(): number {
		return this.elementRef.nativeElement.clientWidth;
	}

	get height(): number {
		return this.elementRef.nativeElement.clientHeight;
	}

}
