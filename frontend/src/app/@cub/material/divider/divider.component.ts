import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	ViewEncapsulation
} from '@angular/core';

import { CoerceBoolean } from 'angular-core';

@Component({
	selector		: 'cub-divider',
	template		: '',
	styleUrls		: [ './divider.scss' ],
	host			: { class: 'cub-divider' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBDividerComponent {

	@HostBinding( 'class.cub-divider-vertical' )
	get classVertical(): boolean { return this.vertical; }

	@Input() @CoerceBoolean() public vertical: boolean;

}
