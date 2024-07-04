import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	// HostListener,
	inject,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	AliasOf,
	CoerceBoolean,
	CoerceCssPixel,
	DefaultValue
} from 'angular-core';

// export type CUBButtonType
// 	= 'primary'
// 		| 'secondary'
// 		| 'tertiary'
// 		| 'destructive';
export type CUBButtonType
	= 'primary'
		| 'secondary'
		| 'destructive';
export type CUBButtonSize
	= 'x-small' | 'small' | 'large';

@Component({
	selector: 'button[cubButton]',
	templateUrl: './button.pug',
	styleUrls: [ './button.scss' ],
	host: { class: 'cub-button' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBButtonComponent {

	@HostBinding( 'attr.type' )
	@Input() @DefaultValue()
	public type: string = 'button';
	@Input( 'cubButton' ) @DefaultValue()
	public buttonType: CUBButtonType = 'primary';
	@Input() @DefaultValue()
	public size: CUBButtonSize = 'small';
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
	@Input() @CoerceBoolean()
	public active: boolean;
	@Input() @CoerceBoolean()
	public loading: boolean;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		const classes: ObjectType<boolean>
			= {
				'cub-button-x-small':
					this.size === 'x-small',
				'cub-button-small':
					this.size === 'small',
				'cub-button-large':
					this.size === 'large',
				'cub-button--active':
					this.active,
				'cub-button--loading':
					this.loading,
			};

		if ( this.buttonType ) {
			classes[ `cub-button-${this.buttonType}` ]
				= true;
		}

		return classes;
	}

	// @HostListener( 'keydown.enter', [ '$event' ] )
	// @HostListener( 'keydown.space', [ '$event' ] )
	// protected onKeydownEnterOrSpace(
	// 	e: KeyboardEvent
	// ) {
	// 	if ( this._elementRef.nativeElement
	// 		!== document.activeElement ) {
	// 		return;
	// 	}

	// 	e.preventDefault();
	// }

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
