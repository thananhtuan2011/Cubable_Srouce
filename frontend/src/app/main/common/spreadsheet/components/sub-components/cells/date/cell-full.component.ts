import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input
} from '@angular/core';

import {
	createCUBDate,
	CUBDate,
	DATE_FORMAT_REGEXP,
	isCUBDate
} from '@cub/material/date-picker';
import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';

import {
	Unsubscriber
} from '@core';

import {
	DateData
} from '@main/common/field/interfaces';
import {
	DateField
} from '@main/common/field/objects';

import {
	CellTouchEvent
} from '../field-cell-touchable';
import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

import {
	DatePickerComponent
} from './date-picker.component';

@Unsubscriber()
@Component({
	selector: 'date-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			date-field-cell
			date-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFieldCellFullComponent
	extends FieldCellInputable<DateData> {

	@Input() public field: DateField;

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _datePickerMenuRef:
		CUBMenuRef<DatePickerComponent>;

	get pickedDate(): CUBDate {
		return this
		._datePickerMenuRef
		.instance
		.date;
	}
	set pickedDate( date: CUBDate ) {
		this
		._datePickerMenuRef
		.instance
		.date = date;
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

		this.input( e );

		if (
			this
			._datePickerMenuRef
			?.isOpened
		) {
			return;
		}

		this._datePickerMenuRef
			= this
			._menuService
			.open<DatePickerComponent>(
				this.elementRef,
				DatePickerComponent,
				{
					date: this.data,
					dateOnly: !this.field.timeFormat,
					onPicked: this._onDatePicked.bind( this ),
				},
				{
					autoFocus: false,
					position: 'start-below',
					restoreFocus: 'origin',
				}
			);
	}

	/**
	 * @param {Event} _e
	 * @return {void}
	 */
	protected onInputBoxInput(
		_e: Event
	) {
		const content: string
			= this.inputBox.textContent;
		let date: CUBDate;

		if ( content.length ) {
			if ( !content.match( DATE_FORMAT_REGEXP ) ) {
				return;
			}

			date = createCUBDate(
				content,
				this.field.inputFormat
			);

			if ( !date.isValid() ) {
				return;
			}
		}

		this.pickedDate = date;
	}

	/**
	 * @param {InputBoxContent} _content
	 * @return {void}
	 */
	protected onInputBoxEdited(
		_content: InputBoxContent
	) {
		this.data = this.pickedDate;

		this.save();
	}

	/**
	 * @param {FocusEvent} _e
	 * @return {void}
	 */
	protected onInputBoxBlur(
		_e: FocusEvent
	) {
		setTimeout(
			() => {
				this.isInputting = false;

				this.cdRef.markForCheck();
			}
		);
	}

	/**
	 * @param {CUBDate=} date
	 * @return {void}
	 */
	private _onDatePicked(
		date: CUBDate = this.pickedDate
	) {
		if ( !date ) return;

		const data: CUBDate
			= isCUBDate( this.data )
				? this.data
				: createCUBDate( this.data );

		if ( data.isSame( date ) ) {
			return;
		}

		this.data = date;

		this.save();

		this.cdRef.markForCheck();
	}

}
