import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	AliasOf,
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

export enum CUBBadgeSize {
	Small = 'small',
	Large = 'large',
}

@Component({
	selector: 'cub-badge, [cubBadge]',
	template: '<ng-content></ng-content>',
	styleUrls: [ './badge.scss' ],
	host: { class: 'cub-badge' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBBadgeComponent {

	@Input() @CoerceNumber()
	public count: number;
	@Input() @AliasOf( 'count' )
	public cubBadge: number;
	@HostBinding( 'style.--badge-color' )
	@Input() public color: string;
	@HostBinding( 'style.--badge-text-color' )
	@Input() public textColor: string;
	@Input() @DefaultValue()
	public size: CUBBadgeSize = CUBBadgeSize.Small;
	@Input() @CoerceBoolean()
	public inline: boolean;

	@HostBinding( 'attr.data-count' )
	get attrDataCount(): number | string {
		if ( ( this.count as number ) > 99 ) {
			return '99+';
		}

		return _.isFinite( this.count )
			? this.count
			: undefined;
	}

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-badge--small':
				this.size === CUBBadgeSize.Small,
			'cub-badge--large':
				this.size === CUBBadgeSize.Large,
			'cub-badge--inline':
				this.inline,
			'cub-badge--multi-digits':
				( this.count as number ) >= 10,
		};
	}

}
