import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	SimpleChanges
} from '@angular/core';
import {
	BehaviorSubject
} from 'rxjs';
import _ from 'lodash';

import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';
import {
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	PeopleData,
	PeopleOption
} from '@main/common/field/interfaces';
import {
	PeopleField
} from '@main/common/field/objects';

import {
	FieldCellEditable
} from '../field-cell-editable';
import {
	CellTouchEvent
} from '../field-cell-touchable';

import {
	PeopleOptionPickerComponent
} from './people-option-picker.component';
import {
	PeoplePopupComponent
} from './people-popup.component';

@Component({
	selector: 'people-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			people-field-cell
			people-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleFieldCellFullComponent
	extends FieldCellEditable<PeopleData>
	implements OnChanges, OnDestroy {

	@Input() public field: PeopleField;

	protected readonly selectedOptions$: BehaviorSubject<PeopleOption[]>
		= new BehaviorSubject<PeopleOption[]>( null );

	protected availableUsers: PeopleOption[];
	protected optionPickerRef: CUBMenuRef;
	protected popupRef: CUBPopupRef;
	protected expanderRef: HTMLElement;

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	override ngOnChanges(
		changes: SimpleChanges
	) {
		super.ngOnChanges( changes );

		if ( !changes.data ) return;

		this._initSelectedOptions();
	}

	override ngOnDestroy() {
		super.ngOnDestroy();

		this.selectedOptions$.complete();
	}

	protected override onDetach() {
		super.onDetach();

		this.optionPickerRef?.close();
		this.popupRef?.close();
	}

	/**
	 * @param {CellTouchEvent} e
	 * @return {void}
	 */
	protected override onTouch(
		e: CellTouchEvent
	) {
		if ( this.readonly ) {
			return;
		}

		let searchQuery: string;

		if ( e instanceof KeyboardEvent ) {
			searchQuery = e.key;
		}

		this.openOptionPicker(
			undefined,
			searchQuery
		);
	}

	/**
	 * @param {PeopleOption} optionValue
	 * @return {void}
	 */
	protected addValue(
		optionValue: PeopleOption
	) {
		this.data ||= {
			value: [],
			selected: [],
		};

		if ( _.includes( this.data.value, optionValue.id ) ) {
			this.save();

			this._initSelectedOptions();
			return;
		}

		if ( this.field.isMultipleSelect ) {
			this.data.value.push( optionValue.id );
			this.data.selected.push( optionValue );
		} else {
			this.data.value = [ optionValue.id ];
			this.data.selected = [ optionValue ];
		}

		this.save();

		this._initSelectedOptions();
	}

	/**
	 * @param {MouseEvent=} e
	 * @return {void}
	 */
	protected openPeoplePopup( e?: MouseEvent ) {
		if ( e ) {
			this.expanderRef
				= e.target as HTMLElement;
		}

		if ( this.popupRef?.isOpened ) {
			return;
		}

		this.optionPickerRef?.close();

		this.popupRef
			= this._popupService.open(
				this.expanderRef,
				PeoplePopupComponent,
				{
					field: this.field,
					data: this.data,
					readonly: this.readonly,
					selectedOptions$: this.selectedOptions$,
					onOptionPicked:
						this._onOptionPicked.bind( this ),
					onOptionDeselected:
						this._onOptionDeselected.bind( this ),
				}
			);
	}

	/**
	 * @param {ElementRef=} origin
	 * @param {string=} searchQuery
	 * @return {void}
	 */
	protected openOptionPicker(
		origin: ElementRef = this.elementRef,
		searchQuery?: string
	) {
		if ( this.optionPickerRef?.isOpened ) {
			return;
		}

		this.popupRef?.close();

		this.optionPickerRef
			= this._menuService.open(
				origin,
				PeopleOptionPickerComponent,
				{
					searchQuery,
					field: this.field,
					data: this.data,
					onOptionPicked:
						this._onOptionPicked.bind( this ),
					updatePickerPosition:
						this._updatePickerPosition.bind( this ),
				},
				{ position: 'start-below' }
			);
	}

	/**
	 * @param {PeopleOption} option
	 * @param {boolean=} isFromPopup
	 * @return {void}
	 */
	protected removeValue(
		option: PeopleOption,
		isFromPopup?: boolean
	) {
		if ( !this.data ) return;

		const cellValue: PeopleData = {
			value: _.pull(
				this.data.value,
				option.id
			),
			selected: _.pull(
				this.data.selected,
				option
			),
		};

		this.data = cellValue;

		this.save(
			_.isStrictEmpty( cellValue.value )
				? null
				: cellValue
		);

		this._initSelectedOptions();

		if ( isFromPopup ) return;

		this._reloadPickerMenu();
	}

	/**
	 * @return {void}
	 */
	private _reloadPickerMenu() {
		if ( !this.optionPickerRef?.isOpened ) {
			return;
		}

		this.optionPickerRef.close();
		this.openOptionPicker();
	}

	/**
	 * @return {void}
	 */
	private _updatePickerPosition() {
		this.optionPickerRef?.updatePosition();
	}

	/**
	 * @return {void}
	 */
	private _onOptionPicked(
		option: PeopleOption
	) {
		this.addValue( option );
	}

	/**
	 * @param {PeopleOption} option
	 * @param {boolean=} isFromPopup
	 * @return {void}
	 */
	private _onOptionDeselected(
		option: PeopleOption,
		isFromPopup?: boolean
	) {
		this.removeValue(
			option,
			isFromPopup
		);
	}

	/**
	 * @return {void}
	 */
	private _initSelectedOptions() {
		this.selectedOptions$.next(
			this.data
				? this.data.selected
				: []
		);

		setTimeout(() => {
			this._updatePickerPosition();
		});
	}
}
