import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	CreatedTimeField
} from '@main/common/field/objects';

import {
	DateComparisonBase
} from '../date-comparison-base';

@Component({
	selector: 'created-time-comparison',
	templateUrl: '../date-comparison-base.pug',
	styleUrls: [ '../date-comparison-base.scss', '../../../styles/comparison-base.scss' ],
	host: { class: 'created-time-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedTimeComparisonComponent
	extends DateComparisonBase<CreatedTimeField>{}
