import {
	Component, Input, ElementRef,
	ViewEncapsulation, ContentChild, SimpleChanges,
	OnChanges, HostListener, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import { ContrastPipe, DefaultValue, CoerceBoolean, CoerceCssPixel } from '@core';

import { WGCButtonIconDirective } from '../button-icon/wgc-button-icon.directive';

export type WGCIFabButtonSize = 'small' | 'medium' | 'large' | 'xlarge';
export type WGCIFabAlignment = 'left' | 'right' | 'center';

@Component({
	selector		: 'button[wgcFabButton]',
	templateUrl		: './wgc-fab-button.pug',
	styleUrls		: [ './wgc-fab-button.scss' ],
	providers		: [ ContrastPipe ],
	host			: { class: 'wgc-fab-button' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCFabButtonComponent implements OnChanges {

	@HostBinding( 'attr.type' )
	get attrType(): string { return this.type || undefined; }

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean { return this.disabled || undefined; }

	@HostBinding( 'style.--fab-button-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--fab-button-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'style.--fab-button-icon-color' )
	get styleTextColor(): string { return this.iconColor; }

	@HostBinding( 'style.--fab-button-icon-size' )
	get styleIconSize(): string { return this.iconSize; }

	@HostBinding( 'style.--fab-button-border-color' )
	get styleBorderColor(): string { return this.borderColor; }

	@HostBinding( 'style.--fab-button-border-style' )
	get styleBorderStyle(): string { return this.borderStyle; }

	@HostBinding( 'style.--fab-button-border-width' )
	get styleWidth(): string { return this.borderWidth; }

	@HostBinding( 'class.wgc-fab-button--has-icon' )
	get classHasIcon(): boolean { return !!this.buttonIcon || !!this.icon; }

	@HostBinding( 'class.wgc-fab-button--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-fab-button--loading' )
	get classLoading(): boolean { return this.loading; }

	@HostBinding( 'class.wgc-fab-button--small' )
	get classSmall(): boolean { return this.size === 'small'; }

	@HostBinding( 'class.wgc-fab-button--medium' )
	get classMedium(): boolean { return this.size === 'medium'; }

	@HostBinding( 'class.wgc-fab-button--large' )
	get classLarge(): boolean { return this.size === 'large'; }

	@HostBinding( 'class.wgc-fab-button--xlarge' )
	get classXLarge(): boolean { return this.size === 'xlarge'; }

	@HostBinding( 'class.wgc-fab-button--left' )
	get classLeft(): boolean { return this.alignment === 'left'; }

	@HostBinding( 'class.wgc-fab-button--right' )
	get classRight(): boolean { return this.alignment === 'right'; }

	@HostBinding( 'class.wgc-fab-button--center' )
	get classCenter(): boolean { return this.alignment === 'center'; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@ContentChild( WGCButtonIconDirective ) public buttonIcon: WGCButtonIconDirective;

	@Input() @DefaultValue() public type: string = 'button';
	@Input() public color: string;
	@Input() public icon: string;
	@Input() public iconColor: string;
	@Input() @CoerceCssPixel() public iconSize: string;
	@Input() public borderColor: string;
	@Input() public borderStyle: string;
	@Input() @CoerceCssPixel() public borderWidth: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public loading: boolean;
	@Input() @DefaultValue() @CoerceCssPixel() public size: string | WGCIFabButtonSize = 'medium';
	@Input() @DefaultValue() public alignment: WGCIFabAlignment = 'center';

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
