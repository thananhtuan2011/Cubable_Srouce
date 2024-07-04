import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	Output,
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
} from '../../../icon';

export type CUBMenuItemType
	= 'default' | 'destructive';
export type CUBMenuItemPosition
	= 'first' | 'last';

@Component({
	selector: 'button[cubMenuItem]',
	templateUrl: './menu-item.pug',
	styleUrls: [ './menu-item.scss' ],
	host: { class: 'cub-menu-item' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMenuItemComponent {

	@Input( 'cubMenuItem' ) @DefaultValue()
	public itemType: CUBMenuItemType = 'default';
	@Input() @DefaultValue() @CoerceBoolean()
	public autoClose: boolean = true;
	@HostBinding( 'class.cub-menu-item--pointing' )
	@Input() @CoerceBoolean()
	public pointing: boolean;
	@HostBinding( 'class.cub-menu-item--selected' )
	@Input() @CoerceBoolean()
	public selected: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() public leadingIcon: string;
	@Input() public leadingIconColor: string | CUBIconColor;
	@Input() @DefaultValue() @CoerceCssPixel()
	public leadingIconSize: string = '20px';
	@Input() public trailingIcon: string;
	@Input() public trailingIconColor: string | CUBIconColor;
	@Input() @DefaultValue() @CoerceCssPixel()
	public trailingIconSize: string = '20px';
	@Input() @AliasOf( 'leadingIcon' )
	public icon: string;
	@Input() @AliasOf( 'leadingIconColor' )
	public iconColor: string | CUBIconColor;
	@Input() @AliasOf( 'leadingIconSize' ) @CoerceCssPixel()
	public iconSize: string;
	@Input() public context: ObjectType;
	@Input() public beforeTrigger:
		( item: CUBMenuItemComponent ) =>
			boolean | Promise<boolean>;

	@Output() public triggered:
		EventEmitter<MouseEvent | KeyboardEvent>
		= new EventEmitter<MouseEvent | KeyboardEvent>();
	@Output() public pointingChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	public readonly elementRef: ElementRef
		= inject( ElementRef );
	public readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	public position: CUBMenuItemPosition;

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.disabled || undefined;
	}

	@HostBinding( 'class.cub-menu-item-destructive' )
	get classDestructive(): boolean {
		return this.itemType === 'destructive';
	}

	@HostBinding( 'class.cub-menu-item-first' )
	get classFirst(): boolean {
		return this.position === 'first';
	}

	@HostBinding( 'class.cub-menu-item-last' )
	get classLast(): boolean {
		return this.position === 'last';
	}

	/**
	 * @return {void}
	 */
	public click() {
		this
		.elementRef
		.nativeElement
		.click();
	}

	/**
	 * @param {MouseEvent | KeyboardEvent} e
	 * @return {void}
	 */
	public trigger(
		e: MouseEvent | KeyboardEvent
	) {
		let isContinue: boolean
			| Promise<boolean> = true;

		if ( this.beforeTrigger ) {
			isContinue
				= this.beforeTrigger( this );

			if ( isContinue instanceof Promise ) {
				isContinue
				.then(( v: boolean ) => {
					if ( !v ) return;

					this.triggered.emit( e );
				});
				return;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
		if ( isContinue !== true ) {
			return;
		}

		this.triggered.emit( e );
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public point(
		emitEvent: boolean = true
	) {
		if ( this.pointing ) {
			return;
		}

		this.pointing = true;

		if ( !emitEvent ) {
			return;
		}

		this
		.pointingChange
		.emit( this.pointing );
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public unpoint(
		emitEvent: boolean = true
	) {
		if ( !this.pointing ) {
			return;
		}

		this.pointing = false;

		if ( !emitEvent ) {
			return;
		}

		this
		.pointingChange
		.emit( this.pointing );
	}

	/**
	 * @return {void}
	 */
	public scrollToElement() {
		this
		.elementRef
		.nativeElement
		.scrollIntoView({
			block: 'nearest',
		});
	}

	@HostListener(
		'click',
		[ '$event' ]
	)
	protected onClick(
		e: MouseEvent
	) {
		this.trigger( e );
	}

	@HostListener( 'mousemove' )
	protected onMousemove() {
		if ( this.disabled ) {
			return;
		}

		this.point();
	}

	@HostListener( 'mouseleave' )
	protected onMouseleave() {
		if ( this.disabled || this.selected ) {
			return;
		}

		this.unpoint();
	}

	@HostListener(
		'focus',
		[ '$event' ]
	)
	protected onFocus(
		e: FocusEvent
	) {
		e.preventDefault();
	}

}
