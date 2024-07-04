import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Inject,
	Optional
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';
import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBPopupRef
} from '@cub/material/popup';

import {
	PeopleData,
	PeopleOption
} from '@main/common/field/interfaces';
import {
	PeopleField
} from '@main/common/field/objects';

import {
	PeopleOptionPickerComponent,
	PeopleOptionPickerMenuContext
} from './people-option-picker.component';

type PeopleExpandPopupContext
	= PeopleOptionPickerMenuContext & {
	readonly: boolean;
	selectedOptions$: BehaviorSubject<PeopleOption[]>;
};

@Component({
	selector: 'people-popup',
	templateUrl: './people-popup.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeoplePopupComponent {

	protected data: PeopleData;
	protected field: PeopleField;
	protected readonly: boolean;
	protected optionPickerRef: CUBMenuRef;
	protected selectedOptions$: BehaviorSubject<PeopleOption[]>;

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {PeopleExpandPopupContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: PeopleExpandPopupContext
	) {
		this.data = this.popupContext.data;
		this.field = this.popupContext.field;
		this.readonly
			= this.popupContext.readonly;
		this.selectedOptions$
			= this.popupContext.selectedOptions$;
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected openOptionPicker(
		e: MouseEvent
	) {
		if ( this.optionPickerRef?.isOpened ) {
			return;
		}

		this.optionPickerRef = this._menuService.open(
			e.target as HTMLElement,
			PeopleOptionPickerComponent,
			{
				...this.popupContext,
				updatePickerPosition:
					this._updatePickerPosition.bind( this ),
			},
			{ position: 'start-below' }
		);
	}

	/**
	 * @param {PeopleOption} option
	 * @return {void}
	 */
	protected removeOption(
		option: PeopleOption
	) {
		this.popupContext
		.onOptionDeselected( option, true );
	}

	/**
	 * @return {void}
	 */
	private _updatePickerPosition() {
		this.optionPickerRef?.updatePosition();
	}

}
