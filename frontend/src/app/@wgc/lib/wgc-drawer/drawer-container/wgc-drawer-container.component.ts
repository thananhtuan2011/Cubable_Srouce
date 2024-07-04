import {
	Component, ViewEncapsulation, Input,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceBoolean } from '@core';

@Component({
	selector		: 'wgc-drawer-container, [wgcDrawerContainer]',
	templateUrl		: './wgc-drawer-container.pug',
	styleUrls		: [ './wgc-drawer-container.scss' ],
	host			: { class: 'wgc-drawer-container' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDrawerContainerComponent {

	@HostBinding( 'class.wgc-drawer-container--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@Input() @CoerceBoolean() public stretch: boolean;

}
