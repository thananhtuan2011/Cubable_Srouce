import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';

import { CoerceNumber, DefaultValue } from 'angular-core';

@Component({
	selector		: 'cub-loading',
	templateUrl		: './loading.pug',
	styleUrls		: [ './loading.scss' ],
	host			: { class: 'cub-loading' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBLoadingComponent {

	@Input() @DefaultValue() public color: string = '#3634a3';
	@Input() @DefaultValue() public backgroundColor: string = '#e4e4e6';
	@Input() @DefaultValue() @CoerceNumber() public size: number = 10;

}
