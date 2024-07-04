import {
	Component, Input, ViewChild,
	TemplateRef, ContentChildren, QueryList,
	AfterContentInit, ChangeDetectionStrategy
} from '@angular/core';
import { startWith } from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, untilCmpDestroyed
} from '@core';
import { WGCDropdownItemComponent } from '../dropdown-item/wgc-dropdown-item.component';

@Unsubscriber()
@Component({
	selector		: 'wgc-dropdown-group-item',
	templateUrl		: './wgc-dropdown-group-item.pug',
	host			: { class: 'wgc-dropdown-group-item' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDropdownGroupItemComponent implements AfterContentInit {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@ContentChildren( WGCDropdownItemComponent ) public dropdownItems: QueryList<WGCDropdownItemComponent>;

	@Input() public title: string;
	@Input() public label: string;
	@Input() public color: string;
	@Input() public icon: string;
	@Input() public dotColor: string;
	@Input( 'class' ) public classes: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public truncate: boolean = true;
	@Input() @DefaultValue() @CoerceNumber() public truncateLimitLine: number = 2;

	get children(): WGCDropdownItemComponent[] { return ( this.dropdownItems as ObjectType )._results; }

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.dropdownItems
		.changes
		.pipe(
			startWith( this.dropdownItems ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCDropdownItemComponent> ) => {
			_.forEach(
				( items as ObjectType )._results,
				( item: WGCDropdownItemComponent ) => item.parent = this
			);
		} );
	}

}
