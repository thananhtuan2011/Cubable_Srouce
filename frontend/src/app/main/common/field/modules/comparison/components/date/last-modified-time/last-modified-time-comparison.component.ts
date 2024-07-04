import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	LastModifiedTimeField
} from '@main/common/field/objects';

import {
	DateComparisonBase
} from '../date-comparison-base';

@Component({
	selector: 'last-modified-time-comparison',
	templateUrl: '../date-comparison-base.pug',
	styleUrls: [ '../date-comparison-base.scss', '../../../styles/comparison-base.scss' ],
	host: { class: 'last-modified-time-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedTimeComparisonComponent
	extends DateComparisonBase<LastModifiedTimeField>{}
