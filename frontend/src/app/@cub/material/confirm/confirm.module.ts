import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBButtonModule } from '../button';
import { CUBIconModule } from '../icon';
import { CUBPopupModule } from '../popup';

import { CUBConfirmComponent } from './confirm.component';
import { CUBConfirmService } from './confirm.service';

@NgModule({
	imports: [
		CoreModule,

		CUBButtonModule,
		CUBIconModule,
		CUBPopupModule,
	],
	exports: [
		CUBConfirmComponent,
	],
	declarations: [
		CUBConfirmComponent,
	],
	providers: [
		CUBConfirmService,
	],
})
export class CUBConfirmModule {}
