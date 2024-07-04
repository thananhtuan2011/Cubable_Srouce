import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	BaseDisplayBase
} from './base-display-base';

@Unsubscriber()
@Component({
	selector: 'base-display-grid',
	templateUrl: '../templates/base-display-grid.pug',
	styleUrls: [ '../styles/base-display-grid.scss', '../styles/base-common.scss' ],
	host: { class: 'base-display-grid' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDisplayGridComponent
	extends BaseDisplayBase {}
