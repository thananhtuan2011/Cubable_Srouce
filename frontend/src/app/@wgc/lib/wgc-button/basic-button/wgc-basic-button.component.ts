import {
	Component, Input, ElementRef,
	ViewEncapsulation, ContentChild, HostListener,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { DefaultValue, CoerceBoolean, CoerceCssPixel } from '@core';
import { WGCButtonIconDirective } from '../button-icon/wgc-button-icon.directive';

export type WGCIBasicButtonAlignment = 'left' | 'right' | 'center';

@Component({
	selector		: 'button[wgcBasicButton]',
	templateUrl		: './wgc-basic-button.pug',
	styleUrls		: [ './wgc-basic-button.scss' ],
	host			: { class: 'wgc-basic-button' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCBasicButtonComponent {

	@HostBinding( 'attr.type' )
	get attrType(): string { return this.type || undefined; }

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean { return this.disabled || undefined; }

	@HostBinding( 'style.--basic-button-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--basic-button-icon-size' )
	get styleIconSize(): string { return this.iconSize; }

	@HostBinding( 'class.wgc-basic-button--has-icon' )
	get classHasIcon(): boolean { return !!this.buttonIcon || !!this.icon; }

	@HostBinding( 'class.wgc-basic-button--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-basic-button--left' )
	get classLeft(): boolean { return this.alignment === 'left'; }

	@HostBinding( 'class.wgc-basic-button--right' )
	get classRight(): boolean { return this.alignment === 'right'; }

	@HostBinding( 'class.wgc-basic-button--center' )
	get classCenter(): boolean { return this.alignment === 'center'; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@ContentChild( WGCButtonIconDirective ) public buttonIcon: WGCButtonIconDirective;

	@Input() @DefaultValue() public type: string = 'button';
	@Input() public color: string;
	@Input() public icon: string;
	@Input() @DefaultValue() @CoerceCssPixel() public iconSize: string = '20px';
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @DefaultValue() public alignment: WGCIBasicButtonAlignment = 'left';

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 */
	constructor( private _elementRef: ElementRef ) {}

	@HostListener( 'keydown.enter', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerKeyDownEnterAndSpace( event: KeyboardEvent ) {
		this._elementRef.nativeElement === document.activeElement && event.preventDefault();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public preventClickOnWrapper( event: Event ) {
		event.preventDefault();
		event.stopPropagation();
		this._elementRef.nativeElement.click();
	}

}
