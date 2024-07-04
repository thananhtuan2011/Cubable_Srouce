import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	HostBinding,
	HostListener,
	Input,
	QueryList,
	ViewEncapsulation
} from '@angular/core';
import {
	filter,
	startWith,
	takeUntil
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBListItemComponent
} from './list-item.component';

@Unsubscriber()
@Component({
	selector: 'cub-list',
	template: '<ng-content></ng-content>',
	styleUrls: [ './list.scss' ],
	host: { class: 'cub-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBListComponent implements AfterContentInit {

	@ContentChildren(
		CUBListItemComponent,
		{ descendants: true }
	)
	public readonly items:
		QueryList<CUBListItemComponent>;

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;

	ngAfterContentInit() {
		this
		.items
		.changes
		.pipe(
			startWith( this.items ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			(
				items: QueryList<CUBListItemComponent>
			) => {
				items.forEach(
					( item: CUBListItemComponent ) => {
						if ( item.active ) {
							item.scrollToElement();
						}

						item
						.focused$
						.pipe(
							takeUntil( this.items.changes ),
							untilCmpDestroyed( this )
						)
						.subscribe(() => {
							items.forEach(
								(
									_item: CUBListItemComponent
								) => {
									if ( item === _item ) {
										return;
									}

									_item.unpoint();
								}
							);
						});

						item.pointingChange
						.pipe(
							filter( ( v: boolean ) => v ),
							takeUntil( this.items.changes ),
							untilCmpDestroyed( this )
						)
						.subscribe(() => {
							items.forEach(
								(
									_item: CUBListItemComponent
								) => {
									if ( item === _item ) {
										return;
									}

									_item.blur();
									_item.unpoint();
								}
							);
						});
					}
				);
			}
		);
	}

	/**
	 * @return {void}
	 */
	public choosePointingItem() {
		const pointingItem: CUBListItemComponent
			= _.find(
				this.items.toArray(),
				{ pointing: true }
			);

		if ( !pointingItem
			|| pointingItem.disabled ) {
			return;
		}

		pointingItem.click();
	}

	/**
	 * @return {void}
	 */
	public pointPreviousItem() {
		const list: CUBListItemComponent[]
			= this.items.toArray();
		let pointingIndex: number
			= _.findLastIndex(
				list,
				( item: CUBListItemComponent ) =>
					item.pointing
			);
		let newPointingItem:
			CUBListItemComponent;

		do {
			newPointingItem
				= this
				.items
				.get( --pointingIndex );
		} while (
			newPointingItem?.disabled
		);

		this.pointItem( newPointingItem );
	}

	/**
	 * @return {void}
	 */
	public pointNextItem() {
		const list: CUBListItemComponent[]
			= this.items.toArray();
		let pointingIndex: number
			= _.findLastIndex(
				list,
				( item: CUBListItemComponent ) =>
					item.pointing
			);
		let newPointingItem:
			CUBListItemComponent;

		do {
			newPointingItem
				= this
				.items
				.get( ++pointingIndex );
		} while (
			newPointingItem?.disabled
		);

		this.pointItem( newPointingItem );
	}

	/**
	 * @param {CUBListItemComponent} item
	 * @return {void}
	 */
	public pointItem(
		item: CUBListItemComponent
	) {
		if ( !item ) {
			return;
		}

		item.point();
		item.scrollToElement();
	}

	/**
	 * @param {number} idx
	 * @return {void}
	 */
	public pointItemByIndex(
		idx: number
	) {
		const item: CUBListItemComponent
			= this.items.get( idx );

		this.pointItem( item );
	}

	@HostListener(
		'keydown',
		[ '$event' ]
	)
	protected onKeydown(
		e: KeyboardEvent
	) {
		switch ( e.key ) {
			case 'ArrowUp':
				e.preventDefault();

				this.pointPreviousItem();
				break;
			case 'ArrowDown':
				e.preventDefault();

				this.pointNextItem();
				break;
			case 'Enter':
				e.preventDefault();

				this.choosePointingItem();
				break;
		}
	}

}
