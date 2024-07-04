import {
	Component, ViewEncapsulation, Input,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceBoolean } from '@core';

@Component({
	selector		: 'wgc-divider',
	template		: '',
	styleUrls		: [ './wgc-divider.scss' ],
	host			: { class: 'wgc-divider' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDividerComponent {

	@HostBinding( 'class.wgc-divider--vertical' )
	get classVertical(): boolean { return this.vertical; }

	@Input() @CoerceBoolean() public vertical: boolean;

}
