import {
	Component, ViewEncapsulation, ContentChildren,
	QueryList, AfterContentInit, Output,
	EventEmitter, Input, OnChanges,
	SimpleChanges, ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceNumber,
	CoerceBoolean, untilCmpDestroyed
} from '@core';
import { WGCButtonToggleItemComponent } from '../wgc-button-toggle-item/wgc-button-toggle-item.component';

@Unsubscriber()
@Component({
	selector		: 'wgc-button-toggle',
	templateUrl		: './wgc-button-toggle.pug',
	styleUrls		: [ './wgc-button-toggle.scss' ],
	host			: { class: 'wgc-button-toggle' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCButtonToggleComponent implements AfterContentInit, OnChanges {

	@HostBinding( 'class.wgc-button-toggle--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@HostBinding( 'class.wgc-button-toggle--reverse' )
	get classReverse(): boolean { return this.reverse; }

	@HostBinding( 'class.wgc-button-toggle--has-border' )
	get classHasBorder(): boolean { return this.hasBorder; }

	@HostBinding( 'class.wgc-button-toggle--has-shadow' )
	get classHasShadow(): boolean { return this.hasShadow; }

	@ContentChildren( WGCButtonToggleItemComponent, { descendants: true } )
	public buttonToggleItems: QueryList<WGCButtonToggleItemComponent>;

	@Input() @DefaultValue() @CoerceNumber() public selectedIndex: number = 0;
	@Input() @CoerceBoolean() public stretch: boolean;
	@Input() @CoerceBoolean() public reverse: boolean;
	@Input() @CoerceBoolean() public hasBorder: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public hasShadow: boolean = true;

	@Output() public selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();
	@Output() public changed: EventEmitter<WGCButtonToggleItemComponent>
		= new EventEmitter<WGCButtonToggleItemComponent>();

	public items: WGCButtonToggleItemComponent[];

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.buttonToggleItems
		.changes
		.pipe(
			startWith( this.buttonToggleItems ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCButtonToggleItemComponent> ) => {
			this.items = ( items as ObjectType )?._results;

			_.forEach( items?.toArray(), ( item: WGCButtonToggleItemComponent, index: number ) => {
				item.isActive = item.activeState && index === this.selectedIndex;

				if ( item.disabled ) return;

				item
				.clicked$
				.pipe(
					takeUntil( this.buttonToggleItems.changes ),
					untilCmpDestroyed( this )
				)
				// .subscribe( ( ev: MouseEvent ) => ev.detail && this.select( index ) );
				.subscribe( this.select.bind( this, index ) );
			} );
		} );
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.selectedIndex ) return;

		this.select( this.selectedIndex, false );
	}

	/**
	 * @param {number} index
	 * @param {boolean} markAsDirty
	 * @return {void}
	 */
	public select( index: number, markAsDirty: boolean = true ) {
		if ( !this.items || ( markAsDirty && index === this.selectedIndex ) ) return;

		const item: WGCButtonToggleItemComponent = this.items[ index ];

		if ( !item || item.disabled ) return;

		if ( item.activeState ) {
			_.forEach( this.items, ( _item: WGCButtonToggleItemComponent ) => { _item.isActive = false; } );

			item.isActive = true;
		}

		this.selectedIndex = index;

		this.selectedIndexChange.emit( index );
		markAsDirty && this.changed.emit( item );
	}

}
