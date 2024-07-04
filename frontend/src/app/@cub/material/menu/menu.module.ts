import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule } from 'angular-core';

import { CUBIconModule } from '../icon';
import { CUBScrollBarModule } from '../scroll-bar';

import { CUBMenuComponent } from './menu/menu.component';
import { CUBMenuContentComponent } from './menu/menu-content/menu-content.component';
import { CUBMenuContentDirective } from './menu/menu-content/menu-content.directive';
import { CUBMenuFooterComponent } from './menu/menu-footer/menu-footer.component';
import { CUBMenuFooterDirective } from './menu/menu-footer/menu-footer.directive';
import { CUBMenuGroupComponent } from './menu/menu-group/menu-group.component';
import { CUBMenuHeaderComponent } from './menu/menu-header/menu-header.component';
import { CUBMenuHeaderDirective } from './menu/menu-header/menu-header.directive';
import { CUBMenuItemComponent } from './menu/menu-item/menu-item.component';
import { CUBMenuItemPrefixDirective } from './menu/menu-item/menu-item-prefix.directive';
import { CUBMenuItemSuffixDirective } from './menu/menu-item/menu-item-suffix.directive';
import { CUBMenuSelectItemComponent } from './menu/menu-item/menu-select-item.component';
import { CUBMenuService } from './menu-trigger-for/menu.service';
import { CUBMenuTriggerForDirective } from './menu-trigger-for/menu-trigger-for.directive';

@NgModule({
	imports: [
		OverlayModule,
		PortalModule,
		ScrollingModule,

		CoreModule,

		CUBIconModule,
		CUBScrollBarModule,
	],
	exports: [
		CUBMenuComponent,
		CUBMenuContentComponent,
		CUBMenuContentDirective,
		CUBMenuFooterComponent,
		CUBMenuFooterDirective,
		CUBMenuGroupComponent,
		CUBMenuHeaderComponent,
		CUBMenuHeaderDirective,
		CUBMenuItemComponent,
		CUBMenuItemPrefixDirective,
		CUBMenuItemSuffixDirective,
		CUBMenuSelectItemComponent,
		CUBMenuTriggerForDirective,
	],
	declarations: [
		CUBMenuComponent,
		CUBMenuContentComponent,
		CUBMenuContentDirective,
		CUBMenuFooterComponent,
		CUBMenuFooterDirective,
		CUBMenuGroupComponent,
		CUBMenuHeaderComponent,
		CUBMenuHeaderDirective,
		CUBMenuItemComponent,
		CUBMenuItemPrefixDirective,
		CUBMenuItemSuffixDirective,
		CUBMenuSelectItemComponent,
		CUBMenuTriggerForDirective,
	],
	providers: [
		CUBMenuService,
	],
})
export class CUBMenuModule {}
