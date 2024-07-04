import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

@Unsubscriber()
@Component({
	selector: 'merge',
	templateUrl: '../templates/merge.pug',
	styleUrls: [ '../styles/merge.scss' ],
	host: { class: 'merge' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MergeComponent {}
