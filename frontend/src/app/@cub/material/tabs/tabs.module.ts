import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';
import { CUBScrollBarModule } from '../scroll-bar';

import { CUBTabContentDirective } from './tab/tab-content.directive';
import { CUBTabHeaderDirective } from './tab/tab-header.directive';
import { CUBTabComponent } from './tab/tab.component';
import { CUBTabsComponent } from './tabs/tabs.component';

@NgModule({
	imports: [
		CoreModule,

		CUBIconModule,
		CUBScrollBarModule,
	],
	exports: [
		CUBTabContentDirective,
		CUBTabHeaderDirective,
		CUBTabComponent,
		CUBTabsComponent,
	],
	declarations: [
		CUBTabContentDirective,
		CUBTabHeaderDirective,
		CUBTabComponent,
		CUBTabsComponent,
	],
	providers: [],
})
export class CUBTabsModule {}
