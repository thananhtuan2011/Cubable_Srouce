import {
	Component, Input, ViewEncapsulation,
	QueryList, ContentChildren, EventEmitter,
	Output, ViewChild, AfterContentInit,
	ChangeDetectionStrategy, HostBinding, ChangeDetectorRef
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, Validators } from '@angular/forms';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import {
	DetectScrollDirective, Unsubscriber, calculateOrders,
	DefaultValue, CoerceBoolean, CoerceNumber,
	untilCmpDestroyed
} from '@core';
import { WGCScrollBarDirective, IWGCScrollBarMode } from '../../wgc-scroll-bar';
import { WGCSearchBoxComponent } from '../../wgc-search-box';
import { WGCListItemComponent } from '../list-item/wgc-list-item.component';

export interface WGCIListItemMoved {
	item: WGCListItemComponent;
	container: WGCListItemComponent[];
	previousIndex: number;
	currentIndex: number;
	previousOrder: number;
	currentOrder: number;
}

@Unsubscriber()
@Component({
	selector		: 'wgc-list',
	templateUrl		: './wgc-list.pug',
	styleUrls		: [ './wgc-list.scss' ],
	host			: { class: 'wgc-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCListComponent implements AfterContentInit {

	@HostBinding( 'style.--list-item-active-color' )
	get styleItemActiveColor(): string { return this.activeColor; }

	@HostBinding( 'class.wgc-list--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@ViewChild( DetectScrollDirective ) public scroller: DetectScrollDirective;
	@ViewChild( WGCScrollBarDirective ) public scrollBar: WGCScrollBarDirective;

	@ContentChildren( WGCListItemComponent, { descendants: true } ) public listItems: QueryList<WGCListItemComponent>;

	@Input() @CoerceBoolean() public skipCheckInViewPort: boolean;
	@Input() @DefaultValue() public name: string;
	@Input() @DefaultValue() public placeholder: string;
	@Input() @CoerceNumber() public itemSize: number;
	@Input() @DefaultValue() @CoerceNumber() public loadMoreBuffer: number = 20;
	@Input() public activeColor: string;
	@Input() @CoerceBoolean() public stretch: boolean;
	@Input() @CoerceBoolean() public displayColorDot: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public hasScrollBar: boolean = true;
	@Input() public scrollBarMode: IWGCScrollBarMode;
	@Input() public searchBox: WGCSearchBoxComponent;
	@Input() @DefaultValue() public formControl: FormControl = new FormControl(
		undefined,
		[ Validators.required, Validators.maxLength( 255 ) ]
	);

	@Output() public itemsMoved: EventEmitter<WGCIListItemMoved[]> = new EventEmitter<WGCIListItemMoved[]>();
	@Output() public loadMore: EventEmitter<boolean> = new EventEmitter<boolean>();

	public items: WGCListItemComponent[];

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.listItems
		.changes
		.pipe(
			startWith( this.listItems ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCListItemComponent> ) => {
			const _items: WGCListItemComponent[] = ( items as ObjectType )?._results;

			this.items = _.map( _items, ( item: WGCListItemComponent ) => {
				item
				.changes$
				.pipe(
					takeUntil( this.listItems.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe( () => this._cdRef.markForCheck() );

				item
				.editingSubject$
				.pipe(
					takeUntil( this.listItems.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe( () => {
					_.forEach( _items, ( _item: WGCListItemComponent ) => _item.isEditing && _item?.cancel() );

					setTimeout( () => {
						this.formControl.markAsPristine();
						this.formControl.markAsUntouched();
						this.formControl.setValue( item.label );

						item.isEditing = true;

						item.editing.emit( item.isEditing );
					} );
				} );

				if ( !item.id || !item.order ) item.order = item.order || Infinity;

				return item;
			} );

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @param {CdkDragDrop} event
	 * @return {void}
	 */
	public onDropped( event: CdkDragDrop<WGCListItemComponent[]> ) {
		const currentIndex: number = event.currentIndex;
		const previousIndex: number = event.previousIndex;

		if ( currentIndex === previousIndex ) return;

		moveItemInArray( event.container.data, previousIndex, currentIndex );

		const orders: ObjectType<number> = calculateOrders( _.map( this.items, 'order' ), currentIndex );
		const target: WGCListItemComponent = this.items[ currentIndex ];
		const itemsMovedEvents: WGCIListItemMoved[] = [];

		_.forEach( orders, ( order: number, index: string ) => {
			const item: WGCListItemComponent = this.items[ Number( index ) ];
			const previousOrder: number = item.order;
			const currentOrder: number = order;

			// Set new order
			item.order = currentOrder;

			// Set highlight
			item.isDropped = true;

			itemsMovedEvents.push({
				item, previousOrder, currentOrder,
				container		: this.items,
				currentIndex	: target === item ? currentIndex : Number( index ),
				previousIndex	: target === item ? previousIndex : Number( index ),
			});
		} );

		this.itemsMoved.emit( itemsMovedEvents );
	}

}
