import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBListComponent } from './list.component';
import { CUBListGroupComponent } from './list-group.component';
import { CUBListItemComponent } from './list-item.component';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBListComponent,
		CUBListGroupComponent,
		CUBListItemComponent,
	],
	declarations: [
		CUBListComponent,
		CUBListGroupComponent,
		CUBListItemComponent,
	],
	providers: [],
})
export class CUBListModule {}
