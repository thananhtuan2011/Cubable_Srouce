import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCCodeBlockComponent } from './wgc-code-block.component';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [ WGCCodeBlockComponent ],
	declarations: [ WGCCodeBlockComponent ],
	providers	: [],
})
export class WGCCodeBlockModule {}
