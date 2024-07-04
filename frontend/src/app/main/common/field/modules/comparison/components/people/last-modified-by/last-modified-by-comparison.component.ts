import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	PeopleComparisonBase
} from '../people-comparison-base';

@Unsubscriber()
@Component({
	selector: 'last-modified-by-comparison',
	templateUrl: '../people-comparison-base.pug',
	styleUrls: [ '../../../styles/comparison-base.scss' ],
	host: { class: 'last-modified-by-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedByComparisonComponent
	extends PeopleComparisonBase {}
