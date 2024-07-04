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
import { ULID } from 'ulidx';
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
	PeopleOption,
	PeopleData
} from '@main/common/field/interfaces';
import {
	PeopleField
} from '@main/common/field/objects';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

export type PeopleOptionPickerMenuContext = {
	field: PeopleField;
	data: PeopleData;
	searchQuery?: string;
	onOptionPicked?: ( option: PeopleOption ) => void;
	updatePickerPosition?: () => void;
	onOptionDeselected?: (
		option: PeopleOption,
		reloadPopup?: boolean
	) => void;
};

@Unsubscriber()
@Component({
	selector: 'people-option-picker',
	templateUrl: './people-option-picker.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleOptionPickerComponent implements OnInit {

	@ViewChild( CUBSearchBoxComponent )
	private _searchBox: CUBSearchBoxComponent;

	protected data: PeopleData;
	protected field: PeopleField;
	protected searchQuery: string;
	protected isSearched: boolean = true;
	protected suggestionNumber: number = 6;
	protected availableUsers: PeopleOption[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );

	private _usersBK: PeopleOption[];

	get filteredUsers(): PeopleOption[] {
		return this._searchBox?.filteredData;
	}

	/**
	 * @constructor
	 * @param {CUBMenuRef} menuRef
	 * @param {PeopleOptionPickerMenuContext} menuContext
	 */
	constructor(
		@Optional() @Inject( CUB_MENU_REF )
		protected menuRef: CUBMenuRef,
		@Optional() @Inject( CUB_MENU_CONTEXT )
		protected menuContext: PeopleOptionPickerMenuContext
	) {
		this.searchQuery = this.menuContext.searchQuery;
		this.field = this.menuContext.field;
		this.data = this.menuContext.data;
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._userService
		.getUsersFromPeopleField(
			_.pick(
				this.field,
				'includeSetting',
				'excludeSetting'
			)
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( options: PeopleOption[] ) => {
			this._usersBK = options;

			this._setUsersAvailableSelect(
				this._usersBK
			);

			this._cdRef.markForCheck();
		});
	}

	/**
	 * @return {void}
	 */
	protected onSearching() {
		this.availableUsers
			= _.differenceBy( this._usersBK, this.data?.selected, 'id' );
		this.isSearched = false;
	}
	/**
	 * @param {string} searchQuery
	 * @return {void}
	 */
	protected searched(
		results: PeopleOption[]
	) {
		this._setUsersAvailableSelect( results );

		this.isSearched = true;
	}

	/**
	 * @param {PeopleOption} user
	 * @return {void}
	 */
	protected pickUser( user: PeopleOption ) {
		if ( _.includes( this.data?.value, user.id ) ) {
			return;
		}

		this._addValue( user );

		this._setUsersAvailableSelect(
			this._usersBK
		);

		this.menuContext
		.onOptionPicked( user );

		if ( this.field.isMultipleSelect ) {
			setTimeout(() => {
				this.searchQuery = null;

				this._searchBox.focusInput();

				this.menuContext.updatePickerPosition();

				this._cdRef.markForCheck();
			});
			return;
		}

		this.menuRef.close();
	}

	/**
	 * @param {PeopleOption[]} allUsers
	 * @return {void}
	 */
	private _setUsersAvailableSelect(
		allUsers: PeopleOption[]
	) {
		const currentSelectedIDs: ULID[]
			= _.map( this.data?.selected, 'id' );
		const allAvailableUsers: PeopleOption[]
			= _.filter(
				allUsers,
				( option: PeopleOption ): boolean => {
					return !_.includes(
						currentSelectedIDs,
						option.id
					);
				}
			);

		this.availableUsers = allAvailableUsers.slice(
			0,
			this.suggestionNumber
		);
	}

	/**
	 * @return {void}
	 */
	private _addValue( user: PeopleOption ) {
		this.data ||= {
			value: [],
			selected: [],
		};

		if ( this.field.isMultipleSelect ) {
			this.data.value.push( user.id );
			this.data.selected.push( user );
		} else {
			this.data.value = [ user.id ];
			this.data.selected = [ user ];
		}
	}
}
