import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	inject,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	AliasOf,
	CoerceCssPixel
} from 'angular-core';

@Component({
	selector: 'button[cubFloatingButton]',
	templateUrl: './floating-button.pug',
	styleUrls: [ './floating-button.scss' ],
	host: { class: 'cub-floating-button' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFloatingButtonComponent {

	@Input() public leadingIcon: string;
	@Input() @CoerceCssPixel()
	public leadingIconSize: string;
	@Input() public trailingIcon: string;
	@Input() @CoerceCssPixel()
	public trailingIconSize: string;
	@Input() @AliasOf( 'leadingIcon' )
	public icon: string;
	@Input() @AliasOf( 'leadingIconSize' ) @CoerceCssPixel()
	public iconSize: string;

	@HostBinding( 'attr.type' )
	protected readonly attrType: string = 'button';

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	@HostListener( 'keydown.enter', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	protected onKeydownEnterAndSpace(
		e: KeyboardEvent
	) {
		if ( this._elementRef.nativeElement
				!== document.activeElement ) {
			return;
		}

		e.preventDefault();
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	public preventClickOnInside(
		e: MouseEvent
	) {
		e.preventDefault();
		e.stopPropagation();

		this
		._elementRef
		.nativeElement
		.click();
	}

}
