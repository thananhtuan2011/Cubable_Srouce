import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBImageComponent } from './image.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBImageComponent,
	],
	declarations: [
		CUBImageComponent,
	],
	providers: [],
})
export class CUBImageModule {}
