import {
	ChangeDetectionStrategy,
	Component,
	ViewChild,
	inject
} from '@angular/core';
import {
	Observer,
	Observable
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	IError
} from '@error/interfaces';

import {
	CUBFormFieldInputDirective,
	CUBFormFieldVariant
} from '@cub/material/form-field';
import {
	CUBMemberPickerDirective,
	CUBTMember
} from '@cub/material/member-picker';
import {
	CUBScrollBarComponent
} from '@cub/material/scroll-bar';

import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	PeopleData,
	PeopleOption
} from '../../../../interfaces';
import {
	PeopleField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';
import { ValueType } from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

@Component({
	selector: 'people-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss', './input.scss' ],
	host: { class: 'people-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			PeopleFieldInputComponent
		),
	],
})
export class PeopleFieldInputComponent
	extends FieldInputEditable<PeopleField, PeopleData> {

	@ViewChild( 'memberPicker' )
	private _memberPicker: CUBMemberPickerDirective;
	@ViewChild( 'searchInput' )
	private _searchInput: CUBFormFieldInputDirective;
	@ViewChild( CUBScrollBarComponent )
	private _scrollBar: CUBScrollBarComponent;

	protected readonly formFieldVariant: typeof CUBFormFieldVariant
		= CUBFormFieldVariant;

	protected keySearch: string;
	protected getUsersFn: typeof this.getUsers
		= this.getUsers.bind( this );

	protected readonly _userService: UserService
		= inject( UserService );

	/**
	 * @param {PeopleData=} data
	 * @return {void}
	 */
	public override patchFormControlValue(
		data: PeopleData
		= (
			( this.data as any )?.valueType
				? ( this.data as any ).data
				: this.data
		)
	) {
		super.patchFormControlValue(
			data?.value as any
		);
	}

	/**
	 * @return {KeyboardEvent} e
	 */
	protected onKeydown(
		e: KeyboardEvent,
		data: PeopleData
	) {
		if (
			e.code !== 'Space'
			|| this._memberPicker?.isOpened
			|| this.disabled
			|| this.readonly
			|| this._searchInput?.isFocused
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		setTimeout(
			() => this._searchInput?.focus()
		);
	}


	/**
	 * @return {void}
	 */
	protected onClick( data: PeopleData ) {
		if (
			this._searchInput?.isFocused
			|| this.readonly
			|| this.disabled
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		setTimeout(
			() => {
				this._searchInput?.focus();
			}
		);
	}

	/**
	 * @param {boolean} focusing
	 * @return {void}
	 */
	protected onBlur( focusing: boolean ) {
		if ( focusing ) return;

		this._scrollBar.scrollToTop();
	}

	/**
	 * @return {void}
	 */
	protected pickerOpened() {
		this.isPreventOnBlur
			= true;
	}

	/**
	 * @return {void}
	 */
	protected pickerClosed() {
		this.isPreventOnBlur
			= false;
	}

	/**
	 * @param {ULID} value
	 * @param {PeopleData} data
	 * @return {void}
	 */
	protected clearValue(
		value: ULID,
		_data: PeopleData
	) {
		let data: PeopleData
			= _.cloneDeep( _data );

		_.pull(
			data.value,
			value
		);
		_.remove(
			data.selected,
			{ id: value }
		);

		if ( _.isStrictEmpty( data.value ) ) {
			data = null;
		}

		this.onDataChanged( data, true );
	}

	/**
	 * @param {CUBTMember[]} e
	 * @param {PeopleData} data
	 * @return {void}
	 */
	protected onAddedUsers( e: CUBTMember[], _data: PeopleData ) {
		let data: PeopleData = {} as PeopleData;

		if ( this.field.isMultipleSelect ) {
			data = {
				value: _data?.value || [],
				selected: _data?.selected || [],
			};

			data.value.push( e[ 0 ].id );
			data.selected.push( e[ 0 ] as IUser );
		} else {
			data.value = [ e[ 0 ].id ];
			data.selected = e as IUser[];
		}

		this.onDataChanged( data, true );
	}

	/**
	 * @return {Observable}
	 */
	protected getUsers(): Observable<PeopleOption[]> {
		return new Observable(
			( observer: Observer<PeopleOption[]> ) => {
				this._userService
				.getUsersFromPeopleField(
					_.pick(
						this.field,
						'includeSetting',
						'excludeSetting'
					)
				)
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: ( options: PeopleOption[] ) => {
						observer.next( options );
						observer.complete();
					},
					error: ( e: IError ) => observer.error( e ),
				});
			}
		);
	}

}
