import {
	Directive,
	HostBinding,
	HostListener
} from '@angular/core';

import {
	FieldCell
} from './field-cell';

@Directive()
export class FieldCellFull<T = any> extends FieldCell<T> {

	@HostBinding( 'class.field-cell-full' )
	protected readonly hostClass: boolean = true;

	@HostListener( 'wheel', [ '$event' ] )
	protected onWheel( e: WheelEvent ) {
		const {
			clientWidth,
			clientHeight,
			scrollWidth,
			scrollHeight,
		}: HTMLElement
			= this.elementRef.nativeElement;

		if ( clientWidth === scrollWidth
			&& clientHeight === scrollHeight ) {
			return;
		}

		e.stopPropagation();
	}

}
