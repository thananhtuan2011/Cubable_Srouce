import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';

import {
	createCUBDate,
	CUBDate
} from '@cub/material/date-picker';

import {
	DATE_FORMATS,
	DateFormat,
	TIME_FORMATS,
	TimeFormat
} from '../../../../interfaces';

type ChangeEvent = {
	format: DateFormat;
	timeFormat: TimeFormat;
};

const CURRENT_DATE: CUBDate
	= createCUBDate();

@Component({
	selector: 'date-format-settings',
	templateUrl: './format-settings.pug',
	host: { class: 'date-format-settings' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFormatSettingsComponent {

	@Input() public format: DateFormat;
	@Input() public timeFormat: TimeFormat;

	@Output() public formatChange: EventEmitter<DateFormat>
		= new EventEmitter<DateFormat>();
	@Output() public timeFormatChange: EventEmitter<TimeFormat>
		= new EventEmitter<TimeFormat>();
	@Output() public changes: EventEmitter<ChangeEvent>
		= new EventEmitter<ChangeEvent>();

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly DATE_FORMATS = DATE_FORMATS;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly TIME_FORMATS = TIME_FORMATS;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly CURRENT_DATE = CURRENT_DATE;

	/**
	 * @return {void}
	 */
	protected onChanges() {
		this.changes.emit({
			format: this.format,
			timeFormat: this.timeFormat,
		});
	}

}
