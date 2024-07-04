import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCLoadingModule } from '../wgc-loading';
import { WGCButtonComponent } from './button/wgc-button.component';
import { WGCBasicButtonComponent } from './basic-button/wgc-basic-button.component';
import { WGCFabButtonComponent } from './fab-button/wgc-fab-button.component';
import { WGCIconButtonComponent } from './icon-button/wgc-icon-button.component';
import { WGCButtonIconDirective } from './button-icon/wgc-button-icon.directive';

@NgModule({
	imports: [
		CoreModule,

		WGCLoadingModule, WGCIconModule,
	],
	exports: [
		WGCButtonComponent, WGCBasicButtonComponent, WGCFabButtonComponent,
		WGCIconButtonComponent, WGCButtonIconDirective,
	],
	declarations: [
		WGCButtonComponent, WGCBasicButtonComponent, WGCFabButtonComponent,
		WGCIconButtonComponent, WGCButtonIconDirective,
	],
	providers: [],
})
export class WGCButtonModule {}
