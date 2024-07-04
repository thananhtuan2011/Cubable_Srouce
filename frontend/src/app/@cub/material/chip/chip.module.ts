import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBChipComponent } from './chip.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports		: [ CUBChipComponent ],
	declarations: [ CUBChipComponent ],
	providers	: [],
})
export class CUBChipModule {}
