import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	EventEmitter,
	forwardRef,
	HostBinding,
	inject,
	Input,
	OnInit,
	Output,
	QueryList,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import {
	NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
	coerceArray
} from '@angular/cdk/coercion';
import {
	combineLatest,
	Subject
} from 'rxjs';
import {
	distinctUntilChanged,
	startWith
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	// CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../../value-accessor';
import {
	CUBFormFieldComponent,
	CUBFormFieldDisplayErrorMode,
	CUBFormFieldInputDirective,
	CUBFormFieldSize,
	CUBFormFieldVariant
} from '../../form-field';
import {
	CUBMenuComponent,
	CUBMenuRef,
	CUBMenuService,
	CUBMenuSizeConfig,
	CUBMenuType
} from '../../menu';

import {
	CUBDropdownGroupComponent
} from '../dropdown-group/dropdown-group.component';
import {
	CUBDropdownItemComponent
} from '../dropdown-item/dropdown-item.component';

import {
	CUBDropdownErrorDirective
} from './dropdown-error.directive';

export type CUBDropdownSize
	= CUBFormFieldSize;
export type CUBDropdownVariant
	= CUBFormFieldVariant;
export type CUBDropdownDisplayErrorMode
	= CUBFormFieldDisplayErrorMode;
export type CUBDropdownMenuSize
	= CUBMenuSizeConfig;

type ChangeState = [ any, boolean? ];

@Unsubscriber()
@Component({
	selector: 'cub-dropdown',
	templateUrl: './dropdown.pug',
	styleUrls: [ './dropdown.scss' ],
	host: { class: 'cub-dropdown' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			multi: true,
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(
				() => CUBDropdownComponent
			),
		},
	],
})
export class CUBDropdownComponent
	extends CUBValueAccessor
	implements OnInit, AfterViewInit, AfterContentInit {

	@Input() public tabindex: number = 0;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public helpText: string;
	@Input() public placeholder: string;
	@Input() public size: CUBDropdownSize;
	@Input() public variant: CUBDropdownVariant;
	@Input() public displayErrorMode: CUBDropdownDisplayErrorMode;
	@Input() @CoerceBoolean() public autoWidth: boolean;
	@Input() @CoerceBoolean() public includeOuterSize: boolean;
	@Input() @CoerceBoolean() public hideRequiredMarker: boolean;
	@HostBinding( 'class.cub-dropdown--single-line' )
	@Input() @CoerceBoolean() public singleLine: boolean;
	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() @CoerceBoolean() public autoOpen: boolean;
	@Input() @CoerceBoolean() public autoReset: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public multiple: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public clearable: boolean = true;
	@Input() @CoerceBoolean() public searchable: boolean;
	@Input() @DefaultValue() public menuSize: CUBDropdownMenuSize
		= { minWidth: 280, maxHeight: 400 };
	@Input() public beforeSelectItem:
		( item: CUBDropdownItemComponent ) =>
			boolean | Promise<boolean>;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public changed: EventEmitter<any>
		= new EventEmitter<any>();
	@Output() public selected: EventEmitter<CUBDropdownItemComponent>
		= new EventEmitter<CUBDropdownItemComponent>();
	@Output() public deselected: EventEmitter<CUBDropdownItemComponent>
		= new EventEmitter<CUBDropdownItemComponent>();
	@Output( 'focus' ) public focusEE: EventEmitter<FocusEvent>
		= new EventEmitter<FocusEvent>();
	@Output( 'blur' ) public blurEE: EventEmitter<FocusEvent>
		= new EventEmitter<FocusEvent>();

	@ViewChild( CUBMenuComponent, { static: true } )
	public readonly dropdownMenu: CUBMenuComponent;

	@ViewChild( CUBFormFieldComponent, { static: true } )
	protected readonly dropdownFormField: CUBFormFieldComponent;
	@ViewChild( CUBFormFieldInputDirective, { static: true } )
	protected readonly dropdownInput: CUBFormFieldInputDirective;
	@ViewChild( 'displayingBlock' )
	protected readonly displayingBlock: ElementRef<HTMLElement>;

	@ContentChild( CUBDropdownErrorDirective )
	protected readonly dropdownError: CUBDropdownErrorDirective;

	@ContentChildren( CUBDropdownGroupComponent )
	protected readonly groups: QueryList<CUBDropdownGroupComponent>;
	@ContentChildren( CUBDropdownItemComponent )
	protected readonly items: QueryList<CUBDropdownItemComponent>;

	protected isSearching: boolean;
	protected displaying: CUBDropdownItemComponent[];
	protected filteredItems: CUBDropdownItemComponent[];
	protected filteredGroups: CUBDropdownGroupComponent[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _changeState$: Subject<ChangeState>
		= new Subject();

	private _allItems: CUBDropdownItemComponent[];

	get isOpened(): boolean {
		return this.dropdownMenu.isOpened;
	}

	get canClear(): boolean {
		return this.clearable
			&& !this.isDisabled
			&& !this.isEmpty
			&& !this.readonly;
	}

	get displayingText(): string {
		return this
		.displayingBlock
		?.nativeElement
		.innerText;
	}

	get displayingItems():
		CUBDropdownItemComponent[] {
		return this.isSearching
			? this.filteredItems
			: this.items.toArray();
	}

	get displayingGroups():
		CUBDropdownGroupComponent[] {
		return this.isSearching
			? this.filteredGroups
			: this.groups.toArray();
	}

	override ngOnInit() {
		super.ngOnInit();

		this
		._changeState$
		.pipe(
			startWith([ this.value, true ]),
			distinctUntilChanged(
				(
					[ prev ]: ChangeState,
					[ curr ]: ChangeState
				): boolean => {
					return this.multiple
						? _.isEqual( prev, curr )
						: prev === curr;
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe((
			[
				value,
				isInitialValue,
			]: ChangeState
		) => {
			if ( isInitialValue ) {
				return;
			}

			this.changed.emit( value );
		});
	}

	ngAfterViewInit() {
		if ( !this.autoOpen ) {
			return;
		}

		this.open();
	}

	ngAfterContentInit() {
		combineLatest([
			this
			.items
			.changes
			.pipe(
				startWith( this.items )
			),
			this
			.groups
			.changes
			.pipe(
				startWith( this.groups )
			),
		])
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			const items: CUBDropdownItemComponent[]
				= this.items.toArray();

			this.groups.forEach((
				group: CUBDropdownGroupComponent
			) => {
				items.push(
					...group
					.items.toArray()
				);
			});

			this._allItems = items;

			this._display();

			this._cdRef.markForCheck();
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override onErroringChanges() {
		this._cdRef.markForCheck();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue(
		value: any,
		emitChangeState: boolean = true
	) {
		if ( !_.isStrictEmpty( value ) ) {
			if ( this.multiple ) {
				value = coerceArray( value );
			} else if ( _.isArray( value ) ) {
				value = value[ 0 ];
			}
		}

		super.writeValue( value );

		this._display();

		if ( emitChangeState ) {
			this._changeState$.next([
				this.isEmpty
					? null
					: this.value,
				true,
			]);
		}
	}

	/**
	 * @return {void}
	 */
	public open() {
		if ( this.isDisabled
			|| this.readonly
			|| this.isOpened ) {
			return;
		}

		this.dropdownFormField.focus();

		const menuRef: CUBMenuRef
			= this._menuService.open(
				this.dropdownFormField.container,
				this.dropdownMenu,
				undefined,
				{
					type: CUBMenuType.FitMenu,
					viewContainerRef: this._vcRef,
					restoreFocus: 'origin',
				}
			);

		menuRef
		.afterOpened()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.opened.emit();

			this.onSearching( '' );

			this._cdRef.markForCheck();
		});

		menuRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.closed.emit();

			this.onSearching( '' );

			this.onTouched();

			this._cdRef.markForCheck();
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		this.dropdownMenu.close();
	}

	/**
	 * @return {void}
	 */
	public clear() {
		this.writeValue( null );

		if ( this.control?.dirty ) {
			this.onChange( null );
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {string} searchQuery
	 * @return {void}
	 */
	protected onSearching(
		searchQuery: string
	) {
		this.isSearching
			= !!searchQuery.length;

		if ( !this.isSearching ) {
			this.filteredItems
				= this.filteredGroups
				= null;

			this.groups.forEach((
				group: CUBDropdownGroupComponent
			) => {
				group.isSearching = false;
				group.filteredItems = null;
			});
			return;
		}

		this.filteredItems
			= this.items.filter((
				item: CUBDropdownItemComponent
			): boolean => {
				return _.search(
					item.label,
					searchQuery
				);
			});

		this.filteredGroups
			= this.groups.filter((
				group: CUBDropdownGroupComponent
			): boolean => {
				group.isSearching = true;
				group.filteredItems
					= group.items.filter((
						item: CUBDropdownItemComponent
					): boolean => {
						return _.search(
							item.label,
							searchQuery
						);
					});

				return !!group.filteredItems.length;
			});
	}

	/**
	 * @return {void}
	 */
	protected onClick() {
		this.open();
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {void}
	 */
	protected onKeydown(
		e: KeyboardEvent
	) {
		if ( e.code !== 'Space' ) {
			return;
		}

		e.preventDefault();

		this.open();
	}

	/**
	 * @return {void}
	 */
	protected onFocus() {
		this.focusEE.emit();
	}

	/**
	 * @return {void}
	 */
	protected onBlur() {
		this.onTouched();

		if ( this.isOpened ) {
			return;
		}

		this._changeState$.next([
			this.isEmpty
				? null
				: this.value,
		]);

		this.blurEE.emit();
	}

	/**
	 * @return {void}
	 */
	protected onCleared() {
		this.writeValue( null, false );
		this.onChange( null );
		this.close();
	}

	/**
	 * @param {CUBDropdownItemComponent} item
	 * @return {void}
	 */
	protected toggleItem(
		item: CUBDropdownItemComponent
	) {
		item.isSelected
			? this.deselectItem( item )
			: this.selectItem( item );
	}

	/**
	 * @param {CUBDropdownItemComponent} item
	 * @return {void}
	 */
	protected selectItem(
		item: CUBDropdownItemComponent
	) {
		if ( item.isBlank
			|| item.isSelected ) {
			return;
		}

		item.isSelected = true;

		let value: any = this.value;

		if ( this.multiple ) {
			value = [ ...value ];

			value.push( item.value );
		} else {
			value = item.value;
		}

		this.selected.emit( item );

		this.writeValue( value, false );
		this.onChange( value );
	}

	/**
	 * @param {CUBDropdownItemComponent} item
	 * @return {void}
	 */
	protected deselectItem(
		item: CUBDropdownItemComponent
	) {
		if ( item.isBlank
			|| !item.isSelected ) {
			return;
		}

		item.isSelected = false;

		let value: any = this.value;

		if ( this.multiple ) {
			value = [ ...value ];

			_.pull( value, item.value );
		} else {
			value = item.value;
		}

		this.deselected.emit( item );

		this.writeValue( value, false );
		this.onChange( value );
	}

	/**
	 * @return {void}
	 */
	private _display() {
		const map: Map<any, CUBDropdownItemComponent>
			= new Map();

		_.forEach(
			this._allItems,
			( item: CUBDropdownItemComponent ) => {
				item.isSelected = false;

				map.set( item.value, item );
			}
		);

		this.displaying
			= this.isEmpty
				? null
				: _.reduce(
					this.multiple
						? this.value
						: [ this.value ],
					(
						memo: CUBDropdownItemComponent[],
						value: any
					): CUBDropdownItemComponent[] => {
						const item: CUBDropdownItemComponent
							= map.get( value )
								|| {
									value,
									isNotAvailable: true,
								} as CUBDropdownItemComponent;

						item.isSelected = true;

						memo.push( item );

						return memo;
					},
					[]
				);

		this._cdRef.detectChanges();
	}

}
