import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { CoreModule } from '@core';

import { WGCIconModule } from '../wgc-icon';
import { WGCScrollBarModule } from '../wgc-scroll-bar';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCButtonModule } from '../wgc-button';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCColorPickerModule } from '../wgc-color-picker';

import { WGCMenuComponent } from './menu/wgc-menu.component';
import { WGCMenuItemComponent } from './menu-item/wgc-menu-item.component';
import { WGCMenuHeaderTitleComponent } from './menu-header-title/wgc-menu-header-title.component';
import { WGCMenuContentComponent } from './menu-content/wgc-menu-content.component';
import { WGCMenuContentDirective } from './menu-content/wgc-menu-content.directive';
import { WGCMenuHeaderComponent } from './menu-header/wgc-menu-header.component';
import { WGCMenuHeaderDirective } from './menu-header/wgc-menu-header.directive';
import { WGCMenuFooterComponent } from './menu-footer/wgc-menu-footer.component';
import { WGCMenuFooterDirective } from './menu-footer/wgc-menu-footer.directive';
import { WGCMenuTriggerForDirective } from './menu-trigger-for/wgc-menu-trigger-for.directive';
import { WGCMenuButtonCloseDirective } from './menu-button-close/wgc-menu-button-close.directive';
import { WGCMenuItemPrefixDirective } from './menu-item-prefix/wgc-menu-item-prefix.directive';
import { WGCMenuItemSuffixDirective } from './menu-item-suffix/wgc-menu-item-suffix.directive';
import { WGCMenuItemIconDirective } from './menu-item-icon/wgc-menu-item-icon.directive';

@NgModule({
	imports: [
		OverlayModule, PortalModule,

		CoreModule,

		WGCIconModule, WGCScrollBarModule, WGCTruncateModule,
		WGCButtonModule, WGCTooltipModule, WGCColorPickerModule,
	],
	exports: [
		WGCMenuComponent, WGCMenuItemComponent, WGCMenuHeaderComponent,
		WGCMenuHeaderDirective, WGCMenuHeaderTitleComponent, WGCMenuFooterComponent,
		WGCMenuFooterDirective, WGCMenuContentComponent, WGCMenuContentDirective,
		WGCMenuTriggerForDirective, WGCMenuButtonCloseDirective, WGCMenuItemIconDirective,
		WGCMenuItemPrefixDirective, WGCMenuItemSuffixDirective,
	],
	declarations: [
		WGCMenuComponent, WGCMenuItemComponent, WGCMenuHeaderComponent,
		WGCMenuHeaderDirective, WGCMenuHeaderTitleComponent, WGCMenuFooterComponent,
		WGCMenuFooterDirective, WGCMenuContentComponent, WGCMenuContentDirective,
		WGCMenuTriggerForDirective, WGCMenuButtonCloseDirective, WGCMenuItemIconDirective,
		WGCMenuItemPrefixDirective, WGCMenuItemSuffixDirective,
	],
	providers: [],
})
export class WGCMenuModule {}
