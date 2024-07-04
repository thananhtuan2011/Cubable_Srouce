import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBIconModule
} from '../icon';

import {
	CUBCardContentComponent
} from './card-content.component';
import {
	CUBCardHeaderComponent
} from './card-header.component';
import {
	CUBCardInfoComponent
} from './card-info.component';
import {
	CUBCardComponent
} from './card.component';

@NgModule({
	imports: [
		CoreModule,

		CUBIconModule,
	],
	exports: [
		CUBCardComponent,
		CUBCardContentComponent,
		CUBCardHeaderComponent,
		CUBCardInfoComponent,
	],
	declarations: [
		CUBCardComponent,
		CUBCardContentComponent,
		CUBCardHeaderComponent,
		CUBCardInfoComponent,
	],
	providers: [],
})
export class CUBCardModule {}
