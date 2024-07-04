import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from 'angular-core';

import { CUBButtonModule } from '../button';
import { CUBDividerModule } from '../divider';
import { CUBFormFieldModule } from '../form-field';
import { CUBIconModule } from '../icon';

import { CUBSearchBoxComponent } from './search-box.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBDividerModule,
		CUBFormFieldModule,
		CUBIconModule,
	],
	exports: [
		CUBSearchBoxComponent,
	],
	declarations: [
		CUBSearchBoxComponent,
	],
	providers: [],
})
export class CUBSearchBoxModule {}
