import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	ReplaySubject
} from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBFormFieldInputDirective,
	CUBFormFieldSize,
	CUBFormFieldVariant
} from '../form-field';

type SearchingEvent = {
	searchQuery: string;
	emitEvent?: boolean;
};

export type CUBSearchBoxSize
	= CUBFormFieldSize;
export type CUBSearchBoxVariant
	= CUBFormFieldVariant;

export type CUBSearchInfo = {
	total: number;
	current: number;
};

@Unsubscriber()
@Component({
	selector: 'cub-search-box',
	templateUrl: './search-box.pug',
	styleUrls: [ './search-box.scss' ],
	host: { class: 'cub-search-box' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBSearchBoxComponent
implements OnChanges, OnDestroy, OnInit {

	@Input() public data: any[];
	@Input() public name: string;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public helpText: string;
	@Input() public placeholder: string;
	@Input() public size: CUBSearchBoxSize;
	@Input() public variant: CUBSearchBoxVariant;
	@Input() public searchQuery: string;
	@Input() @DefaultValue()
	public searchKey: string = 'name';
	@Input() @DefaultValue() @CoerceNumber()
	public debounceTime: number = 400;
	@Input() @CoerceBoolean()
	public autoWidth: boolean;
	@Input() @CoerceBoolean()
	public includeOuterSize: boolean;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public autoReset: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public clearable: boolean = true;
	@Input() public searchInfo: CUBSearchInfo;
	@Input() public filterPredicate: (
		data: any,
		searchQuery: string,
		searchKey?: string
	) => boolean;

	@Output() public searchQueryChange: EventEmitter<string>
		= new EventEmitter<string>();
	@Output( 'searchPrevious' )
	public searchPreviousEE: EventEmitter<number>
			= new EventEmitter<number>();
	@Output( 'searchNext' )
	public searchNextEE: EventEmitter<number>
			= new EventEmitter<number>();
	@Output() public searching: EventEmitter<string>
		= new EventEmitter<string>();
	@Output() public filtered: EventEmitter<any[]>
		= new EventEmitter<any[]>();
	@Output() public focus: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public blur: EventEmitter<Event>
		= new EventEmitter<Event>();

	@ViewChild(
		CUBFormFieldInputDirective,
		{ static: true }
	)
	protected readonly searchQueryInput:
		CUBFormFieldInputDirective;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _searching$:
		ReplaySubject<SearchingEvent>
		= new ReplaySubject<SearchingEvent>();

	private _filteredData: any[];

	get filteredData(): any[] {
		return this._filteredData
			|| this.data;
	}
	set filteredData( data: any[] ) {
		this._filteredData = data;
	}

	ngOnInit() {
		this
		._searching$
		.pipe(
			debounceTime( this.debounceTime ),
			distinctUntilChanged(),
			untilCmpDestroyed( this )
		)
		.subscribe(
			(
				{
					searchQuery,
					emitEvent,
				}: SearchingEvent
			) => {
				if ( emitEvent ) {
					this.searching.emit(
						searchQuery
					);
				}

				this._filter();
			}
		);
	}

	ngOnDestroy() {
		this._searching$.complete();
	}

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( !changes.data
			&& !changes.searchQuery ) {
			return;
		}

		this.search(
			this.searchQuery,
			false
		);
	}

	/**
	 * @param {string} searchQuery
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public search(
		searchQuery: string,
		emitEvent: boolean = true
	) {
		this._searching$.next({
			searchQuery,
			emitEvent,
		});
	}

	/**
	 * @return {void}
	 */
	public searchPrevious() {
		if ( !this.searchInfo?.total ) {
			return;
		}

		let previousIndex: number
			= this
			.searchInfo
			.current - 1;

		if ( previousIndex === 0 ) {
			previousIndex
				= this
				.searchInfo
				.total - 1;
		} else {
			previousIndex--;
		}

		this.searchPreviousEE.emit(
			previousIndex
		);
	}

	/**
	 * @return {void}
	 */
	public searchNext() {
		if ( !this.searchInfo?.total ) {
			return;
		}

		let nextIndex: number
			= this
			.searchInfo
			.current - 1;

		if ( nextIndex
				=== this
				.searchInfo
				.total - 1 ) {
			nextIndex = 0;
		} else {
			nextIndex++;
		}

		this.searchNextEE.emit(
			nextIndex
		);
	}

	/**
	 * @return {void}
	 */
	public focusInput() {
		this
		.searchQueryInput
		?.focus();
	}

	/**
	 * @param {string} searchQuery
	 * @return {void}
	 */
	protected onSearch(
		searchQuery: string
	) {
		if ( this.searchQuery
				=== searchQuery ) {
			return;
		}

		searchQuery ||= '';

		this.search(
			this.searchQuery
				= searchQuery
		);

		this
		.searchQueryChange
		.emit( this.searchQuery );
	}

	/**
	 * @param {Event} e
	 * @return {void}
	 */
	protected onFocus( e: Event ) {
		this.focus.emit( e );
	}

	/**
	 * @param {Event} e
	 * @return {void}
	 */
	protected onBlur( e: Event ) {
		this.blur.emit( e );
	}

	/**
	 * @return {void}
	 */
	private _filter() {
		if ( _.isNil( this.data ) ) {
			return;
		}

		if ( this.searchQuery ) {
			this.filteredData
				= this.data.filter(
					this
					._filterPredicate
					.bind( this )
				);
		} else {
			this.filteredData = [
				...this.data,
			];
		}

		this.filtered.emit(
			this.filteredData
		);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {any} item
	 * @return {boolean}
	 */
	private _filterPredicate(
		item: any
	): boolean {
		return _.isFunction(
			this.filterPredicate
		)
			? this.filterPredicate(
				item,
				this.searchQuery,
				this.searchKey
			)
			: _.search(
				this.searchKey
					? _.get(
						item,
						this.searchKey
					)
					: item,
				this.searchQuery
			);
	}

}
