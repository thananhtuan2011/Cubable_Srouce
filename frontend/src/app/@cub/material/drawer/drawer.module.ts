import { NgModule } from '@angular/core';
import { ResizableModule } from 'angular-resizable-element';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';
import { CUBTooltipModule } from '../tooltip';

import { CUBDrawerLazyDirective } from './drawer/drawer-lazy.directive';
import { CUBDrawerComponent } from './drawer/drawer.component';
import { CUBDrawerContainerComponent } from './drawer-container/drawer-container.component';
import { CUBDrawerContentComponent } from './drawer-content/drawer-content.component';

@NgModule({
	imports: [
		CoreModule,
		ResizableModule,

		CUBIconModule,
		CUBTooltipModule,
	],
	exports: [
		CUBDrawerLazyDirective,
		CUBDrawerComponent,
		CUBDrawerContainerComponent,
		CUBDrawerContentComponent,
	],
	declarations: [
		CUBDrawerLazyDirective,
		CUBDrawerComponent,
		CUBDrawerContainerComponent,
		CUBDrawerContentComponent,
	],
	providers: [],
})
export class CUBDrawerModule {}
