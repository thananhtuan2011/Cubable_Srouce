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
	selector: 'created-by-comparison',
	templateUrl: '../people-comparison-base.pug',
	styleUrls: [ '../../../styles/comparison-base.scss' ],
	host: { class: 'created-by-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedByComparisonComponent
	extends PeopleComparisonBase {}
