import {
	Component, ViewEncapsulation, Input,
	ContentChildren, QueryList, Output,
	EventEmitter, AfterContentInit, ChangeDetectionStrategy,
	OnChanges, SimpleChanges, ViewChild,
	ContentChild, TemplateRef, ChangeDetectorRef,
	OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceNumber,
	CoerceBoolean, untilCmpDestroyed, LocaleService
} from '@core';
import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCIFormFieldAppearance, WGCIFormFieldErrorDisplayMode, WGCFormFieldErrorDirective } from '../../wgc-form-field';
import { WGCMenuTriggerForDirective } from '../../wgc-menu';
import { WGCSearchBoxComponent } from '../../wgc-search-box';
import { WGCDropdownGroupItemComponent } from '../dropdown-group-item/wgc-dropdown-group-item.component';
import { WGCDropdownItemComponent } from '../dropdown-item/wgc-dropdown-item.component';

type WGCDropdownInternalItem = WGCDropdownGroupItemComponent | WGCDropdownItemComponent;

@Unsubscriber()
@Component({
	selector		: 'wgc-dropdown',
	templateUrl		: './wgc-dropdown.pug',
	styleUrls		: [ './wgc-dropdown.scss' ],
	host			: { class: 'wgc-dropdown' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDropdownComponent implements AfterContentInit, OnChanges, OnInit {

	@ViewChild( WGCMenuTriggerForDirective ) public dropdownMenuTrigger: WGCMenuTriggerForDirective;
	@ViewChild( WGCSearchBoxComponent ) public searchBox: WGCSearchBoxComponent;
	@ViewChild( CdkVirtualScrollViewport ) public viewPort: CdkVirtualScrollViewport;

	@ContentChild( 'wgcDropdownDisplay' ) public displayTemp: TemplateRef<any>;
	@ContentChild( WGCFormFieldErrorDirective ) public formFieldError: WGCFormFieldErrorDirective;
	@ContentChildren( WGCDropdownGroupItemComponent ) public dropdownGroupItems: QueryList<WGCDropdownGroupItemComponent>;
	@ContentChildren( WGCDropdownItemComponent ) public dropdownItems: QueryList<WGCDropdownItemComponent>;

	@Input() public ngModel: any;
	@Input() public label: string;
	@Input() public searchPlaceholder: string;
	@Input() public placeholder: string;
	@Input() @DefaultValue() @CoerceNumber() public itemSize: number = 40;
	@Input() @DefaultValue() @CoerceNumber() public tabindex: number = 0;
	@Input() public disableControl: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public multiple: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public canSetNone: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public autoFit: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public strictDisplay: boolean = true;
	@Input() public formControl: FormControl;
	@Input() public appearance: WGCIFormFieldAppearance = 'default';
	@Input() @DefaultValue() public errorDisplayMode: WGCIFormFieldErrorDisplayMode = 'default';

	@Output() public ngModelChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() public changed: EventEmitter<any> = new EventEmitter<any>();
	@Output() public opened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public loadMore: EventEmitter<boolean> = new EventEmitter<boolean>();

	public displayValue: string;
	public selected: any;
	public isOpened: boolean;
	public isDirty: boolean;
	public items: WGCDropdownInternalItem[];
	public selectedGroup: WGCDropdownGroupItemComponent;

	private _bkItems: WGCDropdownInternalItem[];

	get isSelected(): boolean {
		return this.multiple ? this.selected?.length : this.selected;
	}

	get visibleNoneOption(): boolean {
		return this.canSetNone && !this.required && !this.multiple && this.ngModel && !this.searchBox?.searchQuery?.length;
	}

	get useVirtualScroll(): boolean {
		return this.filteredItems?.length >= APP_CONSTANT.USE_VIRTUAL_SCROLL_WITH;
	}

	get filteredItems(): WGCDropdownInternalItem[] {
		return this.searchBox?.filteredData;
	}

	get availableItems(): WGCDropdownItemComponent[] {
		return !this.strictDisplay
			? _.unionBy( this.items, this.selected ? [ this.selected ] : [], 'value' )
			: this.items;
	}

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {LocaleService} _localeService
	 */
	constructor( private _cdRef: ChangeDetectorRef, private _localeService: LocaleService ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.ngModel && this._initSelected();
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this._initSelected() );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		combineLatest([
			this.dropdownItems.changes.pipe( startWith( this.dropdownItems ) ),
			this.dropdownGroupItems.changes.pipe( startWith( this.dropdownGroupItems ) ),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( results: ObjectType ) => {
			this.items = _.concat(
				( results[ 0 ] as ObjectType )?._results,
				( results[ 1 ] as ObjectType )?._results
			);

			this._initSelected();
		} );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onOpened( event: Event ) {
		this.isOpened = true;

		this.selected?.parent && this.selectGroup( this.selected?.parent );
		this.scrollToItem( this.ngModel );
		this.opened.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onClosed( event: Event ) {
		this.isDirty = true;
		this.isOpened = false;

		this.unselectGroup();
		this.closed.emit( event );
		this.formControl?.markAsTouched();
	}

	/**
	 * @param {WGCDropdownInternalItem[]} items
	 * @param {any} value
	 * @return {WGCDropdownItemComponent}
	 */
	public findItem( items: WGCDropdownInternalItem[], value: any ): WGCDropdownItemComponent {
		let matchItem: WGCDropdownItemComponent;

		_.forEach( items, ( item: WGCDropdownInternalItem ) => {
			const children: WGCDropdownItemComponent[] = ( item as WGCDropdownGroupItemComponent ).children;

			if ( !children ) {
				item = item as WGCDropdownItemComponent;

				if ( item.value === value
					|| ( _.isObject( item.value ) && _.isObject( value ) && _.isMatch( item.value, value ) ) ) {
					matchItem = item;
				}

				return !matchItem;
			}

			return !( matchItem = this.findItem( children, value ) );
		} );

		return matchItem;
	}

	/**
	 * @param {WGCDropdownInternalItem} item
	 * @param {boolean} markAsDirty
	 * @return {void}
	 */
	public selectItem( item: WGCDropdownInternalItem, markAsDirty: boolean = true ) {
		item = item as WGCDropdownGroupItemComponent;

		if ( item?.children ) {
			this.selectGroup( item );
			this.scrollToItem( this.ngModel );
			return;
		}

		item = item as unknown as WGCDropdownItemComponent;

		this.displayValue = undefined;

		if ( item ) {
			let ngModel: any = _.clone( this.ngModel );
			let selected: any = _.clone( this.selected );
			let displayValue: string;

			if ( this.multiple ) {
				ngModel = _.arrayResert( ngModel, item.value );
				selected = _.arrayResert( selected, item );
				displayValue = _.arrayJoin( _.map( selected, ( _item: WGCDropdownItemComponent ) => _item.display || _item.label ) );
			} else {
				selected = item;
				ngModel = item.value;
				displayValue = !_.isNil( ngModel ) ? ( item.display || item.label ) : undefined;
			}

			this.ngModel = ngModel;
			this.selected = selected;
			this.displayValue = displayValue;
		} else {
			this.ngModel = this.selected = undefined;
		}

		this._done( markAsDirty );
	}

	/**
	 * @param {WGCDropdownGroupItemComponent} group
	 * @return {void}
	 */
	public selectGroup( group: WGCDropdownGroupItemComponent ) {
		this._bkItems = _.clone( this.items );
		this.items = _.clone( group.children );
		this.selectedGroup = group;

		this.searchBox?.clear();
	}

	/**
	 * @return {void}
	 */
	public unselectGroup() {
		this.items = _.clone( this._bkItems || this.items );
		this.selectedGroup = undefined;

		this.searchBox?.clear();
	}

	/**
	 * @return {void}
	 */
	public addAllItems() {
		let ngModel: any = _.clone( this.ngModel );
		let selected: any = _.clone( this.selected );

		_.forEach( this.filteredItems, ( item: WGCDropdownInternalItem ) => {
			if ( item.disabled || ( item as WGCDropdownGroupItemComponent ).children ) return;

			ngModel = _.union( ngModel, [ ( item as WGCDropdownItemComponent )?.value ] );
			selected = _.union( selected, [ item ] );
		} );

		this.ngModel = ngModel;
		this.selected = selected;
		this.displayValue = _.arrayJoin( _.map( selected, 'label' ) );

		this._done();
	}

	/**
	 * @return {void}
	 */
	public removeAllItems() {
		let ngModel: any = _.clone( this.ngModel );
		let selected: any = _.clone( this.selected );

		_.forEach( this.filteredItems, ( item: WGCDropdownInternalItem ) => {
			if ( item.disabled || ( item as WGCDropdownGroupItemComponent ).children ) return;

			ngModel = _.without( ngModel, ( item as WGCDropdownItemComponent )?.value );
			selected = _.without( selected, item );
		} );

		this.ngModel = ngModel;
		this.selected = selected;
		this.displayValue = _.arrayJoin( _.map( selected, 'label' ) );

		this._done();
	}

	/**
	 * @return {void}
	 */
	public clear() {
		this.displayValue = undefined;
		this.ngModel = this.selected = null;

		this._done();
	}

	/**
	 * @param {any} value
	 * @return {void}
	 */
	public scrollToItem( value: any ) {
		setTimeout( () => {
			const index: number = _.findIndex( this.filteredItems, { value } );

			index !== -1 && this.viewPort?.scrollToIndex( index );
		} );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public open( event?: Event ) {
		this.dropdownMenuTrigger.open( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public close( event?: Event ) {
		this.dropdownMenuTrigger.close( event );
	}

	/**
	 * @return {void}
	 */
	public reopen() {
		this.dropdownMenuTrigger.reopen();
	}

	/**
	 * @param {boolean} markAsDirty
	 * @return {void}
	 */
	private _done( markAsDirty: boolean = true ) {
		this.ngModelChange.emit( this.ngModel );

		if ( !markAsDirty ) return;

		this.changed.emit( this.selected );
		this.formControl?.markAsDirty();
	}

	/**
	 * @return {void}
	 */
	private _initSelected() {
		if ( this.strictDisplay || _.isNil( this.ngModel ) ) this.selected = this.displayValue = undefined;

		if ( this.multiple ) {
			const valueLookup: ObjectType<number> = _.keyBy( this.ngModel );

			this.selected = _.filter( this.availableItems, ( item: WGCDropdownItemComponent ) => !!item && _.has( valueLookup, item.value ) );
			this.displayValue = _.arrayJoin( _.map( this.selected, ( item: WGCDropdownItemComponent ) => item.display || item.label ) );
			return;
		}

		const selected: WGCDropdownItemComponent = this.findItem( this.availableItems, this.ngModel );

		selected && this.selectItem( selected, false );
		this._cdRef.markForCheck();
	}

}
