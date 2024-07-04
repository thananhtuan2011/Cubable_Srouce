import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule } from '@core';

import { WGCAvatarModule } from '../wgc-avatar';
import { WGCButtonModule } from '../wgc-button';
import { WGCIconModule } from '../wgc-icon';
import { WGCMenuModule } from '../wgc-menu';
import { WGCScrollBarModule } from '../wgc-scroll-bar';
import { WGCSearchBoxModule } from '../wgc-search-box';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCTabsModule } from '../wgc-tabs';

import { WGCMemberComponent } from './wgc-member/wgc-member.component';
import { WGCMemberPickerDirective } from './wgc-member-picker/wgc-member-picker.directive';
import { WGCMemberPickerComponent } from './wgc-member-picker/wgc-member-picker.component';
import { WGCMemberListComponent } from './wgc-member-list/wgc-member-list.component';

@NgModule({
	imports: [
		ScrollingModule, OverlayModule, PortalModule,

		CoreModule,

		WGCAvatarModule, WGCButtonModule, WGCMenuModule,
		WGCIconModule, WGCTooltipModule, WGCSearchBoxModule,
		WGCTruncateModule, WGCTabsModule, WGCScrollBarModule,
	],
	exports		: [ WGCMemberComponent, WGCMemberListComponent, WGCMemberPickerDirective, WGCMemberPickerComponent ],
	declarations: [ WGCMemberComponent, WGCMemberListComponent, WGCMemberPickerDirective, WGCMemberPickerComponent ],
	providers	: [],
})
export class WGCMemberPickerModule {}
