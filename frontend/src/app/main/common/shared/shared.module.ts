import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { FileService, GeneralService, PublicAccessService } from './services';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [],
	declarations: [],
	providers	: [ FileService, GeneralService, PublicAccessService ],
})
export class SharedModule {}
