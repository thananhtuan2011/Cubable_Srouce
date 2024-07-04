import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	OnChanges,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceCssPixel,
	DefaultValue
} from 'angular-core';

export type CUBIconType = 'default' | 'destructive';
export type CUBIconColor = 'primary'
	| 'secondary'
	| 'tertiary'
	| 'white'
	| 'black'
	| 'blue'
	| 'success'
	| 'warning'
	| 'error';

@Component({
	selector		: 'cub-icon',
	templateUrl		: './icon.pug',
	styleUrls		: [ './icon.scss' ],
	host			: { class: 'cub-icon' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBIconComponent implements OnChanges {

	@HostBinding( 'attr.color' )
	get attrColor(): CUBIconColor { return this.color as CUBIconColor || undefined; }

	@HostBinding( 'style.--icon-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--icon-font-size' )
	get styleFontSize(): string { return this.size; }

	@HostBinding( 'class' )
	get class(): string {
		return this.type
			? 'cub-icon-' + this.type
			: undefined;
	}

	public static IMAGE_REGEX: RegExp = /(.+)(\.)(jpg|gif|png|svg|webp)$/i;

	@Input() @DefaultValue() public type: CUBIconType = 'default';
	@Input() public name: string;
	// @Input() @DefaultValue() public color: string | CUBIconColor = 'primary';
	@Input() public color: string | CUBIconColor;
	@Input() @CoerceCssPixel() public size: string;

	public isImage: boolean;

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.name && !changes.cubIcon ) return;

		this.isImage = CUBIconComponent.IMAGE_REGEX.test( this.name );
	}

}
