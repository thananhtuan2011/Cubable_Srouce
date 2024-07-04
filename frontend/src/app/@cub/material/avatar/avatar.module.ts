import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { CUBTabsModule } from '../tabs';
import { CUBIconModule } from '../icon';
import { CUBImageModule } from '../image';

import { CUBAvatarComponent } from './avatar.component';

@NgModule({
	imports: [
		CoreModule,

		CUBTabsModule,
		CUBIconModule,
		CUBImageModule,
	],
	exports		: [ CUBAvatarComponent ],
	declarations: [ CUBAvatarComponent ],
	providers	: [],
})
export class CUBAvatarModule {}
