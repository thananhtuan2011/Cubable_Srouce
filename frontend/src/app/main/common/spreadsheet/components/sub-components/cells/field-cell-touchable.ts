import {
	AfterViewInit,
	Directive,
	HostBinding,
	HostListener
} from '@angular/core';

import {
	FieldCellFull
} from './field-cell-full';

export type CellTouchEvent
	= MouseEvent | KeyboardEvent;

@Directive()
export class FieldCellTouchable<T = any>
	extends FieldCellFull<T>
	implements AfterViewInit {

	@HostBinding( 'attr.tabindex' )
	protected readonly tabindex: number = 0;

	@HostBinding( 'class.field-cell-touchable' )
	protected readonly hostClass: boolean = true;

	ngAfterViewInit() {
		this.focus();
	}

	public focus() {
		this
		.elementRef
		.nativeElement
		.focus({ preventScroll: true });
	}

	public blur() {
		this.elementRef.nativeElement.blur();
	}

	public touch(
		e: CellTouchEvent = new MouseEvent( 'click' )
	) {
		this.onTouch( e );
	}

	protected override onAttach() {
		super.onAttach();

		this.focus();
	}

	protected onTouch( _e: CellTouchEvent ) {}

	@HostListener( 'dblclick', [ '$event' ] )
	protected onDblClick( e: MouseEvent ) {
		this.touch( e );
	}

	@HostListener( 'keydown', [ '$event' ] )
	protected onKeydown( e: KeyboardEvent ) {
		// eslint-disable-next-line deprecation/deprecation
		const keyCode: number = e.keyCode;

		// https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		if ( keyCode >= 48 && keyCode <= 90
			|| keyCode >= 96 && keyCode <= 111
			|| keyCode >= 186 && keyCode <= 222 ) {
			this.touch( e );
		}
	}

}
