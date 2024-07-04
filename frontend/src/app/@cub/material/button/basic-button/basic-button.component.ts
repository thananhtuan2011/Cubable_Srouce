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

import {
	CUBIconColor
} from '../../icon';

export type CUBBasicButtonType
	= 'default' | 'destructive';
export type CUBBasicButtonSize
	= 'small' | 'large';
export type CUBBasicButtonColor = 'primary'
	| 'secondary'
	| 'tertiary'
	| 'white'
	| 'black'
	| 'blue'
	| 'success'
	| 'error';

@Component({
	selector: 'button[cubBasicButton]',
	templateUrl: './basic-button.pug',
	styleUrls: [ './basic-button.scss' ],
	host: { class: 'cub-basic-button' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBBasicButtonComponent {

	public readonly elementRef: ElementRef
		= inject( ElementRef );

	@Input( 'cubBasicButton' )
	public buttonType: CUBBasicButtonType;
	@Input() @DefaultValue()
	public size: CUBBasicButtonSize = 'small';
	@Input() public hoverColor: string;
	@Input() public activeColor: string;
	@Input() public color: string | CUBBasicButtonColor;
	@Input() public leadingIcon: string;
	@Input() public leadingIconColor: string | CUBIconColor;
	@Input() @CoerceCssPixel()
	public leadingIconSize: string;
	@Input() public trailingIcon: string;
	@Input() public trailingIconColor: string | CUBIconColor;
	@Input() @CoerceCssPixel()
	public trailingIconSize: string;
	@Input() @AliasOf( 'leadingIcon' )
	public icon: string;
	@Input() @AliasOf( 'leadingIconColor' )
	public iconColor: string | CUBIconColor;
	@Input() @AliasOf( 'leadingIconSize' ) @CoerceCssPixel()
	public iconSize: string;
	@Input() @CoerceBoolean()
	public active: boolean;

	@HostBinding( 'attr.type' )
	protected readonly attrType: string = 'button';

	@HostBinding( 'style' )
	get style(): ObjectType {
		return {
			'--basic-button-hover-color':
				this.hoverColor,
			'--basic-button-active-color':
				this.activeColor,
		};
	}

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		const classes: ObjectType<boolean>
			= {
				'cub-basic-button-small':
					this.size === 'small',
				'cub-basic-button-large':
					this.size === 'large',
				'cub-basic-button--active':
					this.active,
			};

		if ( this.buttonType ) {
			classes[ `cub-basic-button-${this.buttonType}` ]
				= true;
		}

		return classes;
	}

	// @HostListener( 'keydown.enter', [ '$event' ] )
	// @HostListener( 'keydown.space', [ '$event' ] )
	// protected onKeydownEnterOrSpace(
	// 	e: KeyboardEvent
	// ) {
	// 	if ( this.elementRef.nativeElement
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
		.elementRef
		.nativeElement
		.click();
	}

}
