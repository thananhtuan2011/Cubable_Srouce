import {
	Component, Input, ViewEncapsulation,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceBoolean } from '@core';

@Component({
	selector		: 'wgc-action-item',
	templateUrl		: './wgc-action-item.pug',
	styleUrls		: [ './wgc-action-item.scss' ],
	host			: { class: 'wgc-action-item' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCActionItemComponent {

	@HostBinding( 'attr.title' )
	get attrTitle(): string { return this.label; }

	@HostBinding( 'style.--action-item-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'class.wgc-action-item--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-action-item--text-only' )
	get classTextOnly(): boolean { return !this.icon; }

	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() public icon: string;
	@Input() public label: string;
	@Input() public color: string;

}
