import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	Output,
	QueryList,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import {
	filter,
	startWith,
	takeUntil
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceCssPixel,
	CoerceNumber,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBScrollBarDirective
} from '../../scroll-bar';

import {
	CUBMenuRef
} from '../menu-trigger-for/menu.service';

import {
	CUBMenuContentComponent
} from './menu-content/menu-content.component';
import {
	CUBMenuFooterComponent
} from './menu-footer/menu-footer.component';
import {
	CUBMenuHeaderComponent
} from './menu-header/menu-header.component';
import {
	CUBMenuItemComponent
} from './menu-item/menu-item.component';
import {
	CUBMenuSelectItemComponent
} from './menu-item/menu-select-item.component';

@Unsubscriber()
@Component({
	selector: 'cub-menu',
	templateUrl: './menu.pug',
	styleUrls: [ './menu.scss' ],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMenuComponent implements AfterContentInit {

	@Input() @CoerceNumber()
	public tabindex: number;
	@Input() @CoerceCssPixel()
	public width: string;
	@Input() @CoerceCssPixel()
	public minWidth: string;
	@Input() @CoerceCssPixel()
	public maxWidth: string;
	@Input() @CoerceCssPixel()
	public height: string;
	@Input() @CoerceCssPixel()
	public minHeight: string;
	@Input() @CoerceCssPixel()
	public maxHeight: string;
	@Input( 'class' )
	public classList: ObjectType<boolean>;
	@Input() public beforeTriggerItem:
		( item: CUBMenuItemComponent ) =>
			boolean | Promise<boolean>;

	@Output() public opened: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event>
		= new EventEmitter<Event>();

	@ViewChild( TemplateRef, { static: true } )
	public readonly templateRef: TemplateRef<any>;

	@ContentChildren(
		CUBMenuItemComponent,
		{ descendants: true }
	)
	public readonly items:
		QueryList<CUBMenuItemComponent>;
	@ContentChildren(
		CUBMenuSelectItemComponent,
		{ descendants: true }
	)
	public readonly selectItems:
		QueryList<CUBMenuSelectItemComponent>;

	public readonly elementRef: ElementRef
		= inject( ElementRef );
	public readonly vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	public ref: CUBMenuRef;
	public context: ObjectType;
	public scrollBar: CUBScrollBarDirective;

	@ContentChild( CUBMenuHeaderComponent )
	protected readonly menuHeader: CUBMenuHeaderComponent;
	@ContentChild( CUBMenuContentComponent )
	protected readonly menuContent: CUBMenuContentComponent;
	@ContentChild( CUBMenuFooterComponent )
	protected readonly menuFooter: CUBMenuFooterComponent;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _selectedItem: CUBMenuSelectItemComponent;

	get isOpened(): boolean {
		return !!this.ref?.isOpened;
	}

	ngAfterContentInit() {
		this
		.items
		.changes
		.pipe(
			startWith( this.items ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			items: QueryList<CUBMenuItemComponent>
		) => {
			this.scrollBar?.reset();

			items
			.forEach((
				item: CUBMenuItemComponent
			) => {
				item.beforeTrigger
					= this.beforeTriggerItem;

				item
				.triggered
				.pipe(
					takeUntil( this.items.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(() => {
					if ( !item.autoClose ) {
						return;
					}

					this.close();
				});

				item
				.pointingChange
				.pipe(
					filter( ( v: boolean ) => v ),
					takeUntil( this.items.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(() => {
					items
					.forEach((
						otherItem: CUBMenuItemComponent
					) => {
						if ( item === otherItem ) {
							return;
						}

						otherItem.unpoint();
					});
				});
			});
		});

		this
		.selectItems
		.changes
		.pipe(
			startWith( this.selectItems ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			items: QueryList<CUBMenuSelectItemComponent>
		) => {
			items
			.forEach((
				item: CUBMenuSelectItemComponent
			) => {
				item.selected
					||= item === this._selectedItem;

				if ( item.selected ) {
					item.scrollToElement();
				}

				item
				.selectedChange
				.pipe(
					filter( ( v: boolean ) => v ),
					takeUntil( this.selectItems.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(() => {
					this._selectedItem = item;

					items
					.forEach((
						otherItem: CUBMenuSelectItemComponent
					) => {
						if ( item === otherItem ) {
							return;
						}

						otherItem.deselect();
					});
				});
			});
		});
	}

	/**
	 * @return {void}
	 */
	public markAsOpened() {
		this.opened.emit();

		this.markForCheck();

		this._cdRef.detach();
	}

	/**
	 * @return {void}
	 */
	public markAsClosed() {
		this.closed.emit();

		this.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public close() {
		this.ref?.close();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	public choosePointingItem(
		e: KeyboardEvent
	) {
		const pointingItem: CUBMenuItemComponent
			= _.find(
				this.items.toArray(),
				{ pointing: true }
			);

		if ( !pointingItem
			|| pointingItem.disabled ) {
			return;
		}

		pointingItem.trigger( e );
		pointingItem.click();
	}

	/**
	 * @return {void}
	 */
	public pointPreviousItem() {
		const list: CUBMenuItemComponent[]
			= this.items.toArray();
		let pointingIndex: number
			= _.findLastIndex(
				list,
				(
					item: CUBMenuItemComponent
				) => item.pointing
			);
		let newPointingItem: CUBMenuItemComponent;

		do {
			newPointingItem
				= this.items.get( --pointingIndex );
		} while (
			newPointingItem?.disabled
		);

		this.pointItem( newPointingItem );
	}

	/**
	 * @return {void}
	 */
	public pointNextItem() {
		const list: CUBMenuItemComponent[]
			= this.items.toArray();
		let pointingIndex: number
			= _.findLastIndex(
				list,
				(
					item: CUBMenuItemComponent
				) => item.pointing
			);
		let newPointingItem: CUBMenuItemComponent;

		do {
			newPointingItem
				= this.items.get( ++pointingIndex );
		} while (
			newPointingItem?.disabled
		);

		this.pointItem( newPointingItem );
	}

	/**
	 * @param {CUBMenuItemComponent} item
	 * @return {void}
	 */
	public pointItem(
		item: CUBMenuItemComponent
	) {
		if ( !item ) return;

		item.point();
		item.scrollToElement();

		this.markForCheck();
	}

	/**
	 * @param {number} idx
	 * @return {void}
	 */
	public pointItemByIndex(
		idx: number
	) {
		const item: CUBMenuItemComponent
			= this.items.get( idx );

		this.pointItem( item );
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {void}
	 */
	protected onKeydown(
		e: KeyboardEvent
	) {
		const target: Element
			= e.target as Element;

		if ( target instanceof HTMLInputElement
			|| target instanceof HTMLTextAreaElement
			|| target instanceof HTMLSelectElement ) {
			return;
		}

		switch ( e.code ) {
			case 'ArrowUp':
				e.preventDefault();

				this.pointPreviousItem();
				break;
			case 'ArrowDown':
			case 'Tab':
				e.preventDefault();

				this.pointNextItem();
				break;
			case 'Enter':
			case 'Space':
				e.preventDefault();

				this.choosePointingItem( e );
				break;
		}
	}

}
