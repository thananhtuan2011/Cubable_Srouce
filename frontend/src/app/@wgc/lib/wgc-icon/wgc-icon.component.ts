import {
	Component, Input, ViewEncapsulation,
	OnChanges, SimpleChanges, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import { CoerceCssPixel, AliasOf } from '@core';

@Component({
	selector		: 'wgc-icon, [wgcIcon]',
	templateUrl		: './wgc-icon.pug',
	styleUrls		: [ './wgc-icon.scss' ],
	host			: { class: 'wgc-icon' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCIconComponent implements OnChanges {

	@HostBinding( 'style.--icon-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--icon-font-size' )
	get styleFontSize(): string { return this.size; }

	// @HostBinding( 'style.--icon-line-height' )
	// get styleLineHeight(): string { return this.size; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	public static IMAGE_REGEX: RegExp = /(.+)(\.)(jpg|gif|png|svg)$/i;

	@Input() public name: string;
	@Input() public color: string;
	@Input() @CoerceCssPixel() public size: string;

	@Input() @AliasOf( 'name' ) public wgcIcon: string;

	public isImage: boolean;

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.name ) return;

		this.isImage = WGCIconComponent.IMAGE_REGEX.test( this.name );
	}

}
