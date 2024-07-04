import {
	Component, Input, ViewEncapsulation,
	ElementRef, SimpleChanges, OnChanges,
	HostListener, ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { ContrastPipe, DefaultValue, CoerceBoolean, CoerceCssPixel } from '@core';

export type WGCIIconButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

@Component({
	selector		: 'button[wgcIconButton]',
	templateUrl		: './wgc-icon-button.pug',
	styleUrls		: [ './wgc-icon-button.scss' ],
	host			: { class: 'wgc-icon-button' },
	providers		: [ ContrastPipe ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCIconButtonComponent implements OnChanges {

	@HostBinding( 'attr.type' )
	get attrType(): string { return this.type || undefined; }

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean { return this.disabled || undefined; }

	@HostBinding( 'style.--icon-button-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--icon-button-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'style.--icon-button-icon-color' )
	get styleIconColor(): string { return this.iconColor; }

	@HostBinding( 'style.--icon-button-icon-size' )
	get styleIconSize(): string { return this.iconSize; }

	@HostBinding( 'style.--icon-button-border-color' )
	get styleBorderColor(): string { return this.borderColor; }

	@HostBinding( 'style.--icon-button-border-style' )
	get styleBorderStyle(): string { return this.borderStyle; }

	@HostBinding( 'style.--icon-button-border-width' )
	get styleBorderWidth(): string { return this.borderWidth; }

	@HostBinding( 'class.wgc-icon-button--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-icon-button--circle' )
	get classSquare(): boolean { return this.circle; }

	@HostBinding( 'class.wgc-icon-button--small' )
	get classSmall(): boolean { return this.size === 'small'; }

	@HostBinding( 'class.wgc-icon-button--medium' )
	get classMedium(): boolean { return this.size === 'medium'; }

	@HostBinding( 'class.wgc-icon-button--large' )
	get classLarge(): boolean { return this.size === 'large'; }

	@HostBinding( 'class.wgc-icon-button--xlarge' )
	get classXLarge(): boolean { return this.size === 'xlarge'; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@Input() @DefaultValue() public type: string = 'button';
	@Input() public color: string;
	@Input() public icon: string;
	@Input() public iconColor: string;
	@Input() @CoerceCssPixel() public iconSize: string;
	@Input() public borderColor: string;
	@Input() public borderStyle: string;
	@Input() @CoerceCssPixel() public borderWidth: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public circle: boolean;
	@Input() @DefaultValue() @CoerceCssPixel() public size: string | WGCIIconButtonSize = 'medium';

	private _bkIconColor: string;

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ContrastPipe} _contrastPipe
	 */
	constructor( private _elementRef: ElementRef, private _contrastPipe: ContrastPipe ) {}

	@HostListener( 'keydown.enter', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerKeyDownEnterAndSpace( event: KeyboardEvent ) {
		this._elementRef.nativeElement === document.activeElement && event.preventDefault();
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.iconColor ) this._bkIconColor = this.iconColor;
		if ( changes.color ) this.iconColor = this._bkIconColor || this._contrastPipe.transform( this.color );
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
