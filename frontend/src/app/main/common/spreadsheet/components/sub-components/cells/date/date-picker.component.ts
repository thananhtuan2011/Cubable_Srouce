import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	Inject,
	Optional
} from '@angular/core';

import {
	CUBDate
} from '@cub/material/date-picker';
import {
	CUB_MENU_CONTEXT,
	CUB_MENU_REF,
	CUBMenuRef
} from '@cub/material/menu';

type DatePickerContext = {
	date?: CUBDate;
	dateOnly?: boolean;
	onPicked?: ( date: CUBDate ) => void;
};

@Component({
	selector: 'date-picker',
	templateUrl: './date-picker.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {

	protected dateOnly: boolean;
	protected onPicked: DatePickerContext[ 'onPicked' ];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _date: CUBDate;

	get date(): CUBDate {
		return this._date;
	}
	set date( date: CUBDate ) {
		this._date = date;

		this._cdRef.markForCheck();
	}

	/**
	 * @constructor
	 * @param {CUBMenuRef} menuRef
	 * @param {DatePickerContext} menuContext
	 */
	constructor(
		@Optional() @Inject( CUB_MENU_REF )
		protected menuRef: CUBMenuRef,
		@Optional() @Inject( CUB_MENU_CONTEXT )
		protected menuContext: DatePickerContext
	) {
		this.date = this.menuContext.date;
		this.dateOnly = this.menuContext.dateOnly;
		this.onPicked = this.menuContext.onPicked;
	}

}
