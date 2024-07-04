import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	QueryList,
	ViewEncapsulation
} from '@angular/core';
import {
	startWith,
	takeUntil
} from 'rxjs/operators';

import {
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBExpansionPanelComponent
} from '../expansion-panel/expansion-panel.component';

@Unsubscriber()
@Component({
	selector		: 'cub-accordion',
	template		: '<ng-content></ng-content>',
	host			: { class: 'cub-accordion' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBAccordionComponent implements AfterContentInit {

	@ContentChildren( CUBExpansionPanelComponent )
	public panels: QueryList<CUBExpansionPanelComponent>;

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.panels
		.changes
		.pipe(
			startWith( this.panels ),
			untilCmpDestroyed( this )
		)
		.subscribe(( items: QueryList<CUBExpansionPanelComponent> ) => {
			items.forEach(( item: CUBExpansionPanelComponent ) => {
				item
				.expandedChange
				.pipe(
					takeUntil( this.panels.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(( expanded: boolean ) => {
					if ( !expanded ) return;

					items.forEach(( _item: CUBExpansionPanelComponent ) => {
						_item !== item && _item.collapse();
					});
				});
			});
		});
	}

}
