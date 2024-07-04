import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule
} from 'angular-core';

import { CUBButtonModule } from '../button';
import { CUBCheckboxModule } from '../checkbox';
import { CUBChipModule } from '../chip';
import { CUBFormFieldModule } from '../form-field';
import { CUBIconModule } from '../icon';
import { CUBMenuModule } from '../menu';
import { CUBSearchBoxModule } from '../search-box';

import {
	CUBDropdownErrorDirective
} from './dropdown/dropdown-error.directive';
import {
	CUBDropdownComponent
} from './dropdown/dropdown.component';
import {
	CUBDropdownGroupComponent
} from './dropdown-group/dropdown-group.component';
import {
	CUBDropdownItemComponent,
	CUBDropdownItemDescriptionDirective,
	CUBDropdownItemLabelDirective
} from './dropdown-item/dropdown-item.component';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBCheckboxModule,
		CUBChipModule,
		CUBFormFieldModule,
		CUBIconModule,
		CUBMenuModule,
		CUBSearchBoxModule,
	],
	exports: [
		CUBDropdownComponent,
		CUBDropdownErrorDirective,
		CUBDropdownGroupComponent,
		CUBDropdownItemComponent,
		CUBDropdownItemDescriptionDirective,
		CUBDropdownItemLabelDirective,
	],
	declarations: [
		CUBDropdownComponent,
		CUBDropdownErrorDirective,
		CUBDropdownGroupComponent,
		CUBDropdownItemComponent,
		CUBDropdownItemDescriptionDirective,
		CUBDropdownItemLabelDirective,
	],
	providers: [],
})
export class CUBDropdownModule {}
