import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from '@core';

import {
	CUBButtonModule
} from '../button';
import {
	CUBTooltipModule
} from '../tooltip';

import {
	CUBShowMoreComponent
} from './show-more.component';

@NgModule({
	imports: [
		CoreModule,

		CUBButtonModule,
		CUBTooltipModule,
	],
	exports		: [ CUBShowMoreComponent ],
	declarations: [ CUBShowMoreComponent ],
	providers	: [],
})
export class CUBShowMoreModule {}
