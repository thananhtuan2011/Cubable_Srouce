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
	selector: 'people-comparison',
	templateUrl: '../people-comparison-base.pug',
	styleUrls: [ '../../../styles/comparison-base.scss' ],
	host: { class: 'people-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleComparisonComponent
	extends PeopleComparisonBase {}
