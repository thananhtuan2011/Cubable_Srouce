import {
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	Input,
	QueryList,
	ViewEncapsulation
} from '@angular/core';

import {
	CUBDropdownItemComponent
} from '../dropdown-item/dropdown-item.component';

@Component({
	selector: 'cub-dropdown-group',
	template: '',
	host: { class: 'cub-dropdown-group' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBDropdownGroupComponent {

	@Input() public title: string;

	public isSearching: boolean;
	public filteredItems: CUBDropdownItemComponent[];

	@ContentChildren( CUBDropdownItemComponent )
	public readonly items: QueryList<CUBDropdownItemComponent>;

	get displayingItems(): CUBDropdownItemComponent[] {
		return this.isSearching
			? this.filteredItems
			: this.items.toArray();
	}

}
