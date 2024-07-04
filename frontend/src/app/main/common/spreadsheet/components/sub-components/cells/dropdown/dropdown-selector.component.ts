import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	Inject,
	OnInit,
	Optional,
	ViewChild
} from '@angular/core';
import {
	BehaviorSubject
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUB_MENU_CONTEXT,
	CUB_MENU_REF,
	CUBMenuRef
} from '@cub/material/menu';
import {
	CUBSearchBoxComponent
} from '@cub/material/search-box';

import {
	DropdownData,
	DropdownOption,
	DropdownOptionValue
} from '@main/common/field/interfaces';
import {
	DropdownField
} from '@main/common/field/objects';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';

export type DropdownSelectorContext = {
	field: DropdownField;
	data: DropdownData;
	selectedOptions$: BehaviorSubject<DropdownOption[]>;
	searchQuery?: string;
	onOptionSelected?: (
		option: DropdownOption,
		isNewOption: boolean
	) => void;
	onOptionDeselected?: (
		option: DropdownOption
	) => void;
};

@Unsubscriber()
@Component({
	selector: 'dropdown-selector',
	templateUrl: './dropdown-selector.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownSelectorComponent
implements OnInit {

	@ViewChild( CUBSearchBoxComponent )
	private _searchBox: CUBSearchBoxComponent;

	protected loaded: boolean = true;
	protected searchQuery: string;
	protected field: DropdownField;
	protected data: DropdownData;
	protected options: DropdownOption[];

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	get filteredOptions(): DropdownOption[] {
		return this._searchBox?.filteredData;
	}

	/**
	 * @constructor
	 * @param {CUBMenuRef} menuRef
	 * @param {DropdownSelectorContext} menuContext
	 */
	constructor(
		@Optional() @Inject( CUB_MENU_REF )
		protected menuRef: CUBMenuRef,
		@Optional() @Inject( CUB_MENU_CONTEXT )
		protected menuContext: DropdownSelectorContext
	) {
		this.searchQuery = this.menuContext.searchQuery;
		this.field = this.menuContext.field;
		this.data = this.menuContext.data;
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		if ( this.field.reference?.fieldID ) {
			this.loaded = false;

			this._boardFieldService
			.getDropdownOptions(
				this.field.reference.fieldID
			)
			.pipe(
				finalize( () => {
					this.loaded = true;

					this._cdRef.markForCheck();
				} ),
				untilCmpDestroyed( this )
			)
			.subscribe({
				next: ( options: DropdownOption[] ) => {
					this.field.options = options;

					this._setOptions( options );
					this._selectedOptionsChanged();
				},
			});
		} else {
			this._setOptions( this.field.options );
			this._selectedOptionsChanged();
		}
	}

	/**
	 * @param {DropdownOption} option
	 * @param {boolean=} isNewOption
	 * @return {void}
	 */
	protected selectOption(
		option: DropdownOption,
		isNewOption: boolean = false
	) {
		this.searchQuery = '';

		this.menuContext
		.onOptionSelected?.( option, isNewOption );

		if ( this.field.isMultipleSelect ) {
			setTimeout(() => {
				this.options
					= _.without( this.options, option );

				this._searchBox.focusInput();

				this._cdRef.markForCheck();
			});
			return;
		}

		this.menuRef.close();
	}

	/**
	 * @return {void}
	 */
	protected addNewOption() {
		const newOption: DropdownOption
			= this.field.addOption( this.searchQuery );

		this.selectOption( newOption, true );

		this.searchQuery = '';
	}

	/**
	 * @param {DropdownOption[]} options
	 * @return {void}
	 */
	private _setOptions(
		options: DropdownOption[]
	) {
		if ( this.field.isMultipleSelect ) {
			const lookup: Record<
				DropdownOptionValue,
				DropdownOptionValue
			> = _.keyBy( this.data?.value );

			this.options = _.filter(
				options,
				( option: DropdownOption ): boolean => {
					return !lookup[ option.value ];
				}
			);
		} else {
			this.options = options;
		}
	}

	/**
	 * @return {void}
	 */
	private _selectedOptionsChanged() {
		this.menuContext.selectedOptions$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( selectedOptions: DropdownOption[] ) => {
				const lookup: Record<
					DropdownOptionValue,
					DropdownOption
				> = _.keyBy( selectedOptions, 'value' );

				this.options = _.filter(
					this.field.options,
					( option: DropdownOption ): boolean => {
						return !lookup[ option.value ];
					}
				);

				this._cdRef.markForCheck();
			},
		});
	}

}
