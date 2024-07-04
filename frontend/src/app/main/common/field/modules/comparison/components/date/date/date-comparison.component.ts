import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	DateField
} from '@main/common/field/objects';

import {
	DateComparisonBase
} from '../date-comparison-base';

@Component({
	selector: 'date-comparison',
	templateUrl: '../date-comparison-base.pug',
	styleUrls: [ '../date-comparison-base.scss', '../../../styles/comparison-base.scss' ],
	host: { class: 'date-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateComparisonComponent
	extends DateComparisonBase<DateField>{}
