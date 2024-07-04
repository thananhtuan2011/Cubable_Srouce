import {
	Component, ContentChildren, QueryList,
	AfterContentInit, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import { Unsubscriber, untilCmpDestroyed } from '@core';
import { WGCExpansionPanelComponent } from '../expansion-panel/wgc-expansion-panel.component';

@Unsubscriber()
@Component({
	selector		: 'wgc-accordion',
	templateUrl		: './wgc-accordion.pug',
	host			: { class: 'wgc-accordion' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCAccordionComponent implements AfterContentInit {

	@ContentChildren( WGCExpansionPanelComponent ) public expansionPanels: QueryList<WGCExpansionPanelComponent>;

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.expansionPanels
		.changes
		.pipe(
			startWith( this.expansionPanels ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCExpansionPanelComponent> ) => {
			const itemArr: WGCExpansionPanelComponent[] = ( items as ObjectType )?._results;

			_.forEach( itemArr, ( item: WGCExpansionPanelComponent ) => {
				item
				.expandedChange
				.pipe(
					takeUntil( this.expansionPanels.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe( ( expanded: boolean ) => {
					expanded && _.forEach( itemArr, ( _item: WGCExpansionPanelComponent ) => {
						_item !== item && _item.collapse();
					} );
				} );
			} );
		} );
	}

}
