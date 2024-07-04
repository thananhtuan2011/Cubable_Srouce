import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	BaseDisplayBase
} from './base-display-base';

@Unsubscriber()
@Component({
	selector: 'base-display-table',
	templateUrl: '../templates/base-display-table.pug',
	styleUrls: [ '../styles/base-display-table.scss', '../styles/base-common.scss' ],
	host: { class: 'base-display-table' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDisplayTableComponent
	extends BaseDisplayBase {}
