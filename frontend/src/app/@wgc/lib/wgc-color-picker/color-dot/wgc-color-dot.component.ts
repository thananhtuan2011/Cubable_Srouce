import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import { DefaultValue, CoerceBoolean, CoerceCssPixel, AliasOf } from '@core';

@Component({
	selector		: 'wgc-color-dot, [wgcColorDot]',
	templateUrl		: './wgc-color-dot.pug',
	styleUrls		: [ './wgc-color-dot.scss' ],
	host			: { class: 'wgc-color-dot' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCColorDotComponent {

	@HostBinding( 'style.--color-dot-color' )
	get styleColor(): string{ return this.color; }

	@HostBinding( 'style.--color-dot-size' )
	get styleSize(): string{ return this.size; }

	@HostBinding( 'class.wgc-color-dot--hidden' )
	get classHidden(): boolean { return !this.visible; }

	@HostBinding( 'class.wgc-color-dot--circle' )
	get classCircle(): boolean { return this.circle; }

	@Input() public color: string;
	@Input() @CoerceCssPixel() public size: string;
	@Input() @CoerceBoolean() public circle: boolean;
	@Input() @CoerceBoolean() public viewOnly: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public visible: boolean = true;
	@Input() @AliasOf( 'color' ) public wgcColorDot: string;

	@Output() public colorChange: EventEmitter<string> = new EventEmitter<string>();

	/**
	 * @param {string} color
	 * @return {void}
	 */
	public onColorPicked( color: string ) {
		this.color = color;

		this.colorChange.emit( this.color );
	}

}
