import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import { CoerceBoolean, CoerceCssPixel } from '@core';

@Component({
	selector		: 'wgc-card',
	templateUrl		: './wgc-card.pug',
	styleUrls		: [ './wgc-card.scss' ],
	host			: { class: 'wgc-card' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCardComponent {

	@HostBinding( 'style.--card-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--card-border-width' )
	get styleBorderWidth(): string { return this.borderWidth; }

	@HostBinding( 'style.--card-border-color' )
	get styleBorderColor(): string { return this.borderColor; }

	@HostBinding( 'style.--card-border-style' )
	get styleBorderStyle(): string { return this.borderStyle; }

	@HostBinding( 'style.--card-border-radius' )
	get styleBorderRadius(): string { return this.borderRadius; }

	@HostBinding( 'style.--card-active-color' )
	get styleActiveColor(): string { return this.activeColor || this.color; }

	@HostBinding( 'style.--card-active-border-width' )
	get styleActiveBorderWidth(): string { return this.activeBorderWidth || this.borderWidth; }

	@HostBinding( 'style.--card-active-border-color' )
	get styleActiveBorderColor(): string { return this.activeBorderColor || this.borderColor; }

	@HostBinding( 'style.--card-active-border-style' )
	get styleActiveBorderStyle(): string { return this.activeBorderStyle || this.borderStyle; }

	@HostBinding( 'style.--card-active-border-radius' )
	get styleActiveBorderRadius(): string { return this.activeBorderRadius || this.borderRadius; }

	@HostBinding( 'style.--card-padding-top' )
	get stylePaddingTop(): string { return this.contentPaddingTop || this.contentPaddingVertical; }

	@HostBinding( 'style.--card-padding-bottom' )
	get stylePaddingBottom(): string { return this.contentPaddingBottom || this.contentPaddingVertical; }

	@HostBinding( 'style.--card-padding-left' )
	get stylePaddingLeft(): string { return this.contentPaddingLeft || this.contentPaddingHorizontal; }

	@HostBinding( 'style.--card-padding-right' )
	get stylePaddingRight(): string { return this.contentPaddingRight || this.contentPaddingHorizontal; }

	@HostBinding( 'class.wgc-card--active' )
	get classActive(): boolean { return this.active; }

	@Input() public color: string;
	@Input() @CoerceCssPixel() public borderWidth: string;
	@Input() public borderColor: string;
	@Input() public borderStyle: string;
	@Input() public activeColor: string;
	@Input() @CoerceCssPixel() public activeBorderWidth: string;
	@Input() public activeBorderColor: string;
	@Input() public activeBorderStyle: string;
	@Input() public activeBorderRadius: string;
	@Input() @CoerceCssPixel() public borderRadius: string;
	@Input() @CoerceCssPixel() public contentPaddingVertical: string;
	@Input() @CoerceCssPixel() public contentPaddingHorizontal: string;
	@Input() @CoerceCssPixel() public contentPaddingTop: string;
	@Input() @CoerceCssPixel() public contentPaddingBottom: string;
	@Input() @CoerceCssPixel() public contentPaddingLeft: string;
	@Input() @CoerceCssPixel() public contentPaddingRight: string;
	@Input() @CoerceBoolean() public active: boolean;
	@Input() @CoerceBoolean() public highlight: boolean;
	@Input() @CoerceBoolean() public autoUnhighlight: boolean;

	@Output() public highlightChange: EventEmitter<boolean> = new EventEmitter<boolean>();

}
