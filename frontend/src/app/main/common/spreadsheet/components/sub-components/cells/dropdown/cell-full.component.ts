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
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';
import {
	CUBPopupRef,
	CUBPopupService
} from '@cub/material';

import {
	DropdownField
} from '@main/common/field/objects';
import {
	DropdownData,
	DropdownOption,
	DropdownOptionValue
} from '@main/common/field/interfaces';

import {
	CellTouchEvent
} from '../field-cell-touchable';
import {
	FieldCellEditable
} from '../field-cell-editable';

import {
	DropdownExpanderComponent
} from './dropdown-expander.component';
import {
	DropdownSelectorComponent
} from './dropdown-selector.component';

@Unsubscriber()
@Component({
	selector: 'dropdown-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			dropdown-field-cell
			dropdown-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownFieldCellFullComponent
	extends FieldCellEditable<DropdownData>
	implements OnChanges, OnDestroy {

	@Input() public field: DropdownField;

	protected readonly selectedOptions$: BehaviorSubject<DropdownOption[]>
		= new BehaviorSubject<DropdownOption[]>( null );

	protected selectorRef: CUBMenuRef;
	protected expanderRef: CUBPopupRef;

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	private _isChanged: boolean;

	override ngOnChanges(
		changes: SimpleChanges
	) {
		super.ngOnChanges( changes );

		if ( !changes.data ) return;

		this.selectedOptions$.next(
			this.data?.selected
		);
	}

	override ngOnDestroy() {
		super.ngOnDestroy();

		this.selectedOptions$.complete();
	}

	/**
	 * @return {void}
	 */
	protected override onRevert() {
		this.selectedOptions$.next(
			this.data?.selected
		);
	}

	/**
	 * @param {CellTouchEvent} e
	 * @return {void}
	 */
	protected override onTouch(
		e: CellTouchEvent
	) {
		if ( this.readonly ) return;

		let searchQuery: string;

		if ( e instanceof KeyboardEvent ) {
			searchQuery = e.key;
		}

		this.openSelector(
			undefined,
			searchQuery
		);
	}

	/**
	 * @return {void}
	 */
	protected override onDetach() {
		super.onDetach();

		this.data ||= {} as DropdownData;
		this.data.newOptions = [];

		this.selectorRef?.close();
		this.expanderRef?.close();
	}

	/**
	 * @param {DropdownOptionValue} value
	 * @param {DropdownOption=} newOption
	 * @return {void}
	 */
	protected addValue(
		value: DropdownOptionValue,
		newOption?: DropdownOption
	) {
		const data: DropdownData
			= this.data || { value: [] };

		if (
			_.includes( data.value, value )
		) {
			return;
		}

		if ( this.field.isMultipleSelect ) {
			data.value ||= [];
			data.value.push( value );
		} else {
			data.value = [ value ];
		}

		if ( newOption ) {
			data.newOptions ||= [];

			data.newOptions.push( newOption );
		}

		data.selected ||= [];

		const addedOption: DropdownOption
			= _.find( this.field.options, { value } );

		if ( addedOption ) {
			data.selected.push( addedOption );
		}

		this.data = data;

		this.selectedOptions$.next(
			this.data?.selected
		);

		this.save(
			_.isStrictEmpty( this.data.value )
				? null
				: this.data
		);

		this.cdRef.detectChanges();
	}

	/**
	 * @param {DropdownOptionValue} value
	 * @param {boolean=} shouldSave
	 * @return {void}
	 */
	protected removeValue(
		value: DropdownOptionValue,
		shouldSave?: boolean
	) {
		const newValue: DropdownOptionValue[]
			= _.pull( this.data?.value, value );
		const newOption: DropdownOption
			= _.find(
				this.data.newOptions,
				{ value }
			);

		_.remove( this.data.selected, { value } );
		_.remove( this.data.newOptions, { value } );

		if ( newOption ) this.field.removeOption( newOption );

		if ( shouldSave ) {
			this.save(
				newValue?.length
					? {
						value: newValue,
						selected: this.data.selected,
						newOptions: this.data.newOptions,
					}
					: null
			);
		} else {
			this.validate(
				this.data.value?.length
					? this.data
					: null
			);
		}

		this.selectedOptions$.next(
			this.data?.selected
		);
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected openExpander(
		e: MouseEvent
	) {
		if ( this.expanderRef?.isOpened ) {
			return;
		}

		this.selectorRef?.close();

		this.expanderRef
			= this._popupService.open(
				e.target as HTMLElement,
				DropdownExpanderComponent,
				{
					field: this.field,
					data: this.data,
					readonly: this.readonly,
					selectedOptions$:
						this.selectedOptions$,
					onOptionSelected:
						this
						._onOptionSelected
						.bind( this ),
					onOptionDeselected:
						this
						._onOptionDeselected
						.bind( this ),
				},
				{
					restoreFocus:
						this.elementRef,
				}
			);

		this.expanderRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this._saveOnClose() );
	}

	/**
	 * @param {ElementRef=} origin
	 * @param {string=} searchQuery
	 * @return {void}
	 */
	protected openSelector(
		origin: ElementRef = this.elementRef,
		searchQuery?: string
	) {
		if ( this.selectorRef?.isOpened ) {
			return;
		}

		this.expanderRef?.close();

		this.selectorRef
			= this._menuService.open(
				origin,
				DropdownSelectorComponent,
				{
					searchQuery,
					field: this.field,
					data: this.data,
					selectedOptions$:
						this.selectedOptions$,
					onOptionSelected:
						this
						._onOptionSelected
						.bind( this ),
					onOptionDeselected:
						this
						._onOptionDeselected
						.bind( this ),
				},
				{
					position: 'start-below',
					restoreFocus: 'origin',
				}
			);

		this
		.selectorRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(
			() => this._saveOnClose()
		);
	}

	/**
	 * @param {DropdownOption} option
	 * @param {boolean=} isNewOption
	 * @return {void}
	 */
	private _onOptionSelected(
		option: DropdownOption,
		isNewOption: boolean
	) {
		this._isChanged = true;

		this.addValue(
			option.value,
			isNewOption
				? option
				: null
		);
	}

	/**
	 * @param {DropdownOption} option
	 * @return {void}
	 */
	private _onOptionDeselected(
		option: DropdownOption
	) {
		this._isChanged = true;

		this.removeValue( option.value );
	}

	/**
	 * @return {void}
	 */
	private _saveOnClose() {
		if ( !this._isChanged ) {
			return;
		}

		this.save(
			this.data?.value?.length
				? this.data
				: null
		);

		this._isChanged = false;
	}

}
