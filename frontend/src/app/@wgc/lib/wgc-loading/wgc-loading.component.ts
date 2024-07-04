import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { CoerceNumber, DefaultValue } from '@core';
import { COLOR } from '@resources';

@Component({
	selector		: 'wgc-loading',
	templateUrl		: './wgc-loading.pug',
	styleUrls		: [ './wgc-loading.scss' ],
	host			: { class: 'wgc-loading' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCLoadingComponent {

	@Input() @DefaultValue() public color: string = COLOR.INFO;
	@Input() @DefaultValue() public backgroundColor: string = COLOR.BORDER;
	@Input() @DefaultValue() @CoerceNumber() public size: number = 10;

}
