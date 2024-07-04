import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	QueryList,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import {
	startWith,
	takeUntil
} from 'rxjs/operators';

import {
	CoerceNumber,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBButtonToggleItemComponent
} from './button-toggle-item.component';

@Unsubscriber()
@Component({
	selector		: 'cub-button-toggle',
	template		: '<ng-content></ng-content>',
	styleUrls		: [ './button-toggle.scss' ],
	host			: { class: 'cub-button-toggle' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBButtonToggleComponent implements AfterContentInit, OnChanges {

	@ContentChildren( CUBButtonToggleItemComponent )
	public items: QueryList<CUBButtonToggleItemComponent>;

	@Input() @DefaultValue() @CoerceNumber()
	public selectedIndex: number = 0;

	@Output() public selectedIndexChange: EventEmitter<number>
		= new EventEmitter<number>();

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.items.changes
		.pipe(
			startWith( this.items ),
			untilCmpDestroyed( this )
		)
		.subscribe(( items: QueryList<CUBButtonToggleItemComponent> ) => {
			items.forEach(( item: CUBButtonToggleItemComponent, index: number ) => {
				item.active ||= !item.disabled && index === this.selectedIndex;

				item.clicked$
				.pipe(
					takeUntil( this.items.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(() => {
					this.activateItem( index );

					this.selectedIndexChange.emit( this.selectedIndex = index );
				});
			});
		});
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.selectedIndex ) return;

		this.activateItem( this.selectedIndex );
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public activateItem( index: number ) {
		if ( index === this.selectedIndex ) return;

		const item: CUBButtonToggleItemComponent = this.items.get( index );

		if ( !item || item.disabled ) return;

		this.items.forEach(( _item: CUBButtonToggleItemComponent ) => {
			_item.active = false;
		});

		item.active = true;
	}

}
