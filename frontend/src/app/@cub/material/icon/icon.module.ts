import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBImageModule } from '../image';

import { CUBIconComponent } from './icon.component';

@NgModule({
	imports: [
		CoreModule,

		CUBImageModule,
	],
	exports: [
		CUBIconComponent,
	],
	declarations: [
		CUBIconComponent,
	],
	providers: [],
})
export class CUBIconModule {}
