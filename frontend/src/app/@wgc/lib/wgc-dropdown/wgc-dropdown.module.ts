import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CoreModule, FormModule } from '@core';

import { WGCFormFieldModule } from '../wgc-form-field';
import { WGCSearchBoxModule } from '../wgc-search-box';
import { WGCMenuModule } from '../wgc-menu';
import { WGCIconModule } from '../wgc-icon';
import { WGCTruncateModule } from '../wgc-truncate';
import { WGCButtonModule } from '../wgc-button';
import { WGCColorPickerModule } from '../wgc-color-picker';
import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCDropdownComponent } from './dropdown/wgc-dropdown.component';
import { WGCDropdownGroupItemComponent } from './dropdown-group-item/wgc-dropdown-group-item.component';
import { WGCDropdownItemComponent } from './dropdown-item/wgc-dropdown-item.component';

@NgModule({
	imports: [
		ScrollingModule,

		CoreModule, FormModule,

		WGCFormFieldModule, WGCSearchBoxModule, WGCMenuModule,
		WGCIconModule, WGCTruncateModule, WGCButtonModule,
		WGCColorPickerModule, WGCTooltipModule,
	],
	exports		: [ WGCDropdownComponent, WGCDropdownGroupItemComponent, WGCDropdownItemComponent ],
	declarations: [ WGCDropdownComponent, WGCDropdownGroupItemComponent, WGCDropdownItemComponent ],
	providers	: [],
})
export class WGCDropdownModule {}
