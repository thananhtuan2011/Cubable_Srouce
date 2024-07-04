import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, OnChanges,
	SimpleChanges, ChangeDetectionStrategy, ElementRef,
	ViewChild, OnDestroy, ChangeDetectorRef,
	TemplateRef
} from '@angular/core';
import { Subject, isObservable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import _ from 'lodash';

import {
	Unsubscriber, DefaultValue, CoerceBoolean,
	CoerceNumber, untilCmpDestroyed, INotFoundData
} from '@core';
import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCIFormFieldAppearance, WGCIFormFieldErrorDisplayMode } from '../wgc-form-field';
import { WGCMenuTriggerForDirective } from '../wgc-menu';

@Unsubscriber()
@Component({
	selector		: 'wgc-search-box',
	templateUrl		: './wgc-search-box.pug',
	styleUrls		: [ './wgc-search-box.scss' ],
	host			: { class: 'wgc-search-box' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCSearchBoxComponent implements OnChanges, OnDestroy {

	@ViewChild( WGCMenuTriggerForDirective, { static: true } ) public menuTrigger: WGCMenuTriggerForDirective;
	@ViewChild( 'notFoundTemplate', { static: true } ) public notFoundTemplate: TemplateRef<any>;

	@Input() public data: any[];
	@Input() public suggestion: any;
	@Input() public ngModel: string;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public placeholder: string;
	@Input() @DefaultValue() public prefixIcon: string = 'search';
	@Input() public suffixIcon: string;
	@Input() @DefaultValue() public searchKey: string = 'name';
	@Input() @DefaultValue() public fieldName: string = 'name';
	@Input() @DefaultValue() public fieldDescription: string = 'description';
	@Input() @DefaultValue() public fieldImage: string = 'image';
	@Input() @DefaultValue() public fieldAvatar: string = 'avatar';
	@Input() @DefaultValue() @CoerceNumber() public itemSize: number = 54;
	@Input() @DefaultValue() @CoerceNumber() public debounceTime: number = 400;
	@Input() @DefaultValue() @CoerceBoolean() public trim: boolean = true;
	@Input() @CoerceBoolean() public displayNotFound: boolean;
	@Input() public disableControl: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() @CoerceBoolean() public autoReset: boolean;
	@Input() public notFoundData: INotFoundData;
	@Input() public formControl: FormControl;
	@Input() @DefaultValue() public appearance: WGCIFormFieldAppearance = 'default';
	@Input() @DefaultValue() public errorDisplayMode: WGCIFormFieldErrorDisplayMode = 'default';
	@Input() public filterPredicate: ( data: any, searchQuery: string, searchKey?: string ) => boolean;

	@Output() public ngModelChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() public searching: EventEmitter<string> = new EventEmitter<string>();
	@Output() public cleared: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public filtered: EventEmitter<any[]> = new EventEmitter<any[]>();
	@Output() public suggested: EventEmitter<any> = new EventEmitter<any>();
	@Output() public prefixIconClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output() public suffixIconClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output() public input: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public focus: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public blur: EventEmitter<Event> = new EventEmitter<Event>();

	public searchQuery: string;
	public focusing: boolean;
	public focusIndex: number = 0;
	public filteredData: any[];
	public suggestionData: any[];

	private _searchUpdated$: Subject<string> = new Subject<string>();

	get useVirtualScroll(): boolean {
		return this.suggestionData?.length >= APP_CONSTANT.USE_VIRTUAL_SCROLL_WITH;
	}

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( public elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {
		this._searchUpdated$
		.pipe(
			debounceTime( this.debounceTime ),
			distinctUntilChanged(),
			untilCmpDestroyed( this )
		)
		.subscribe( ( value: string ) => {
			this.searching.emit( value );

			// Start filter
			this._filter();

			// Start suggest
			this.focusing && this._suggest();
		} );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._searchUpdated$.complete();
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.data && this._filter();
		changes.ngModel && this.ngModel !== undefined && this.onSearch( this.ngModel );
	}

	/**
	 * @param {string} searchQuery
	 * @return {void}
	 */
	public onSearch( searchQuery: string ) {
		this.searchQuery = searchQuery || '';

		this._searchUpdated$.next( this.searchQuery );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onClear( event: Event ) {
		this.clear( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onInput( event: Event ) {
		this.input.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onFocus( event: Event ) {
		this.focusing = true;

		this.focus.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onBlur( event: Event ) {
		this.focusing = false;

		this.blur.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public clear( event?: Event ) {
		this.ngModel = this.searchQuery = '';

		this._searchUpdated$.next( this.searchQuery );
		this.ngModelChange.emit( this.ngModel );
		this.filtered.emit( this.data );
		this.cleared.emit( event );
		this._cdRef.detectChanges();
	}

	/**
	 * @param {Event} event
	 * @param {number} index
	 * @return {void}
	 */
	public chooseSuggestItem( event: Event, index: number ) {
		if ( !this.suggestionData ) return;

		const item: any = this.suggestionData[ index ];

		if ( !item ) return;

		event.stopPropagation();
		event.preventDefault();

		this.ngModel = _.get( item, this.searchKey || this.fieldName );

		this._searchUpdated$.next( this.searchQuery );
		this.ngModelChange.emit( this.ngModel );
		this.suggested.emit( item );
		this.menuTrigger.close();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public focusPreviousSuggestItem( event: Event ) {
		if ( !this.suggestionData ) return;

		event.stopPropagation();
		event.preventDefault();

		this.focusIndex = this.focusIndex > 0 ? this.focusIndex - 1 : 0;
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public focusNextSuggestItem( event: Event ) {
		if ( !this.suggestionData ) return;

		event.stopPropagation();
		event.preventDefault();

		const length: number = this.suggestionData?.length - 1;

		this.focusIndex = this.focusIndex < length ? this.focusIndex + 1 : length;
	}

	/**
	 * @return {void}
	 */
	private _toggleMenu() {
		if ( !this.searchQuery || !this.suggestionData?.length ) {
			this.menuTrigger.close();
			return;
		}

		!this.menuTrigger.isMenuOpened && this.menuTrigger.open();
	}

	/**
	 * @return {void}
	 */
	private _filter() {
		if ( this.searchQuery ) {
			this.filteredData = _.filter( this.data, this._filterPredicate.bind( this ) );
		} else {
			this.filteredData = _.clone( this.data );
		}

		this.filtered.emit( this.filteredData );
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _suggest() {
		if ( !this.suggestion ) return;

		const suggestion: any = this.suggestion( this.searchQuery );

		if ( isObservable( suggestion ) ) {
			suggestion
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( ( data: any[] ) => {
				this.suggestionData = data;

				this._toggleMenu();
			} );
			return;
		}

		this.suggestionData = suggestion;

		this._toggleMenu();
	}

	/**
	 * @param {any} item
	 * @return {boolean}
	 */
	private _filterPredicate( item: any ): boolean {
		return _.isFunction( this.filterPredicate )
			? this.filterPredicate( item, this.searchQuery, this.searchKey )
			:_.search(
				this.searchKey ? _.get( item, this.searchKey ) : item,
				this.searchQuery
			);
	};

}
