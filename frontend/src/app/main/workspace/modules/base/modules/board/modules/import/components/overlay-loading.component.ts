import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber,
	CoerceBoolean
} from '@core';

@Unsubscriber()
@Component({
	selector: 'overlay-loading',
	templateUrl: '../templates/overlay-loading.pug',
	styleUrls: [ '../styles/overlay-loading.scss' ],
	host: { class: 'overlay_loading' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayLoadingComponent {

	@Input() @CoerceBoolean() public isLoad: boolean;
	@Input() public percent: number;

}
