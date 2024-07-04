import {
	Directive,
	ElementRef,
	HostListener
} from '@angular/core';

@Directive({
	selector: '[appNumbersOnly]',
})
export class NumbersOnlyDirective {

	private _regex: RegExp = new RegExp(/^[1-9]\d*$/);
	private _specialKeys: Array<string> = ['Backspace', 'Tab'];

	constructor( private _el: ElementRef ) {}
	@HostListener( 'keydown', [ '$event' ] )

	protected onKeyDown(
		event: KeyboardEvent
	) {
		if (
			this._specialKeys.indexOf( event.key ) !== -1
		) {
			return;
		}

		const current: string = this._el.nativeElement.value;
		const next: string = current.concat( event.key );

		if (
			next
			&& !String( next ).match( this._regex )
		) {
			event.preventDefault();
		}
	}
}
