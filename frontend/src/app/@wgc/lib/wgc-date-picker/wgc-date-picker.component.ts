import {
	Component, Input, ViewEncapsulation,
	Output, EventEmitter, AfterViewInit,
	Optional, Inject, ChangeDetectionStrategy,
	HostBinding, OnInit, ViewChild
} from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import {
	DATE_TIME_CONFIG, DateTimeConfig, WeekStart,
	TimeFormat, Memoize, DefaultValue,
	CoerceBoolean
} from '@core';

import { WGCFormFieldInputDirective } from '@wgc/wgc-form-field';

import { CONSTANT as APP_CONSTANT } from '@resources';

interface WGCIDateInMonth {
	year: number;
	month: number;
	date: number;
	picked?: boolean;
	disabled?: boolean;
	today?: boolean;
	inRange?: boolean;
}

type WGCIDateInMonthState = Pick<WGCIDateInMonth, 'disabled' | 'today' | 'picked' | 'inRange'>;

export type WGCIDatePickerMode = 'default' | 'inline';
export type WGCIDatePickerPosition = 'above' | 'below';
export interface WGCIDatePickerPickedEvent {
	range?: Moment[];
	date?: Moment;
	showTime?: boolean;
}

@Component({
	selector		: 'wgc-date-picker',
	templateUrl		: './wgc-date-picker.pug',
	styleUrls		: [ './wgc-date-picker.scss' ],
	host			: { class: 'wgc-date-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDatePickerComponent implements OnInit, AfterViewInit {

	@HostBinding( 'class.wgc-date-picker--inline' )
	get classInline(): boolean { return this.mode === 'inline'; }

	@ViewChild( 'dateInputRef' ) public dateInputRef: WGCFormFieldInputDirective;

	@Input() public maxDateRange: string;
	@Input() @CoerceBoolean() public dateRange: boolean;
	@Input() @CoerceBoolean() public dateOnly: boolean;
	@Input() @CoerceBoolean() public showTime: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public clearable: boolean = true;
	@Input() @DefaultValue() public mode: WGCIDatePickerMode = 'default';

	@Output() public picked: EventEmitter<WGCIDatePickerPickedEvent> = new EventEmitter<WGCIDatePickerPickedEvent>();

	public close: ( event?: Event ) => void;
	public onPicked: ( event: WGCIDatePickerPickedEvent ) => void;
	public tempMinDate: Moment;
	public tempMaxDate: Moment;
	public pickedTime: Moment = moment();
	public currentMoment: Moment = moment();
	public currentMonth: number = this.currentMoment.month();
	public currentYear: number = this.currentMoment.year();
	public displayingMoment: Moment = this.currentMoment.clone();
	public displayingYear: number = this.displayingMoment.year();
	public displayingMonth: number = this.displayingMoment.month();
	public dateInMonth: WGCIDateInMonth[] = [];
	public yearRange: number[] = _.range( -100, 100 );
	public months: string[] = moment.months();
	public times: Moment[] = _.map( _.range( 0, 48 ), ( i: number ) => {
		const hour: number = i / 2;
		const minute: number = i % 2 === 0 ? 0 : 30;

		return this.currentMoment.clone().hour( hour ).minute( minute );
	} );
	public dateFormat: string = 'DD/MM/YYYY';
	public dateFormControl: FormControl = new FormControl( undefined, {
		updateOn: 'blur',
		validators: [
			( control: AbstractControl ): ValidationErrors | null => {
				if ( !control.value ) return null;

				const isIncomplete: boolean = control.value.length < 10;

				if ( isIncomplete ) return { incompleteDate: true };

				let isInvalid: boolean;

				const dateParts: string[] = control.value.split( '/' );
				const formatParts: string[] = this.dateFormat.split( '/' );

				_.forEach( formatParts, ( part: string, index: number ) => {
					const datePart: number = +dateParts[ index ];

					switch ( part ) {
						case 'DD':
							if ( datePart === 0 || datePart > 31 ) isInvalid = true;
							break;
						case 'MM':
							if ( datePart === 0 || datePart > 12 ) isInvalid = true;
							break;
						case 'YYYY':
							if ( datePart === 0 || dateParts[ index ].length < 4 ) isInvalid = true;
							break;
					}

					if ( isInvalid ) return false;
				} );

				if ( isInvalid ) return { isInvalid: true };

				const date: Moment = moment( control.value, this.dateFormat );
				const nonExisted: boolean = !date.isValid();

				if ( nonExisted) return { nonExisted: true };

				if ( this.minDate ) {
					const isBeforeMinDate: boolean = date.isBefore( this.minDate );

					if ( isBeforeMinDate ) return { isBeforeMinDate: true };
				}

				if ( this.maxDate ) {
					const isAfterMaxDate: boolean = date.isAfter( this.maxDate );

					if ( isAfterMaxDate ) return { isAfterMaxDate: true };
				}
			},
		],
	} );

	private _pickedDate: Moment | Moment[];
	private _minDate: Moment;
	private _maxDate: Moment;
	private _timeFormat: TimeFormat;
	private _weekStart: WeekStart;
	private _firstValue: { date?: Moment; showTime?: boolean } = {};

	@Input()
	get pickedDate(): Moment | Moment[] {
		return this._pickedDate;
	}
	set pickedDate( value: Moment | Moment[] ) {
		this._pickedDate = value;

		if ( !this._pickedDate ) {
			if ( !this.dateRange ) this.dateFormControl.setValue( null );
			return;
		}

		let year: number;
		let month: number;

		if ( this.dateRange ) {
			if ( _.nth( this._pickedDate as Moment[], 0 ) ) this._pickedDate[ 0 ] = moment( this._pickedDate[ 0 ] ).startOf( 'd' );
			if ( _.nth( this._pickedDate as Moment[], 1 ) ) this._pickedDate[ 1 ] = moment( this._pickedDate[ 1 ] ).endOf( 'd' );

			year = _.nth( this._pickedDate as Moment[], 0 )?.year();
			month = _.nth( this._pickedDate as Moment[], 0 )?.month();
		} else if ( !_.isArray( this._pickedDate ) ) {
			this._pickedDate = moment( this._pickedDate as Moment );

			year = this._pickedDate.year();
			month = this._pickedDate.month();

			this.dateFormControl.setValue( ( value as Moment ).format( this.dateFormat ) );
		}

		this.displayMonth( year, month );
	}

	@Input()
	get minDate(): Moment {
		return this._minDate;
	}
	set minDate( value: Moment ) {
		this._minDate = value?.clone().startOf( 'd' );

		this._initCalendar();
	}

	@Input()
	get maxDate(): Moment {
		return this._maxDate;
	}
	set maxDate( value: Moment ) {
		this._maxDate = value?.clone().startOf( 'd' );

		this._initCalendar();
	}

	@Input()
	get timeFormat(): TimeFormat {
		return this._timeFormat || this._dateTimeConfig.timeFormat || APP_CONSTANT.TIME_FORMAT;
	}
	set timeFormat( value: TimeFormat ) {
		this._timeFormat = value;
	}

	@Input()
	get weekStart(): WeekStart {
		return !_.isNil( this._weekStart )
			? this._weekStart
			: ( !_.isNil( this._dateTimeConfig.weekStart ) ? this._dateTimeConfig.weekStart : APP_CONSTANT.WEEK_START );
	}
	set weekStart( value: WeekStart ) {
		this._weekStart = value;
	}

	get canSave(): boolean {
		if ( this.dateInputRef?.focusing || !this.dateFormControl.valid ) return false;
		if ( this.showTime !== this._firstValue.showTime ) return true;
		if ( !this._firstValue.date && !this.pickedDate ) return false;
		if ( !this.showTime ) return !this._firstValue.date?.isSame( ( this.pickedDate as Moment ), 'd' );

		const pickedDate: Moment = ( this.pickedDate as Moment )?.clone().hour( this.pickedTime.hour() ).minute( this.pickedTime.minute() );

		return !this._firstValue.date?.isSame( pickedDate as Moment, 'm' );
	}

	/**
	 * @constructor
	 * @param {DateTimeConfig} _dateTimeConfig
	 */
	constructor( @Optional() @Inject( DATE_TIME_CONFIG ) private _dateTimeConfig: DateTimeConfig ) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		if ( this.dateRange ) return;

		if ( _.includes(
			[
				'MM/DD/YYYY', 'MM-DD-YYYY', 'MM/DD/YY',
				'MM-DD-YY', 'YYYY/MM/DD', 'YYYY-MM-DD',
				'YY/MM/DD', 'YY-MM-DD', 'MMMM DD, YYYY',
				'DD MMMM, YYYY', 'MMM DD, YYYY', 'DD MMM, YYYY',
			],
			this._dateTimeConfig.dateFormat
		) ) {
			this.dateFormat = 'MM/DD/YYYY';
			this.pickedDate = this.pickedDate;
		}

		if ( !this.clearable ) this.dateFormControl.addValidators( Validators.required );
		if ( this.pickedDate ) {
			this._firstValue.date = this.pickedDate as Moment;

			this.pickedTime.hour( ( this.pickedDate as Moment ).hour() );
			this.pickedTime.minute( ( this.pickedDate as Moment ).minute() );
		}

		this._firstValue.showTime = this.showTime;
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._initCalendar();
	}

	/**
	 * @param {WeekStart} weekStart
	 * @return {string[]}
	 */
	@Memoize()
	public getWeekdays( weekStart: WeekStart ): string[] {
		const weekdays: string[] = moment.weekdaysShort();

		return weekStart === 1 ? _.union( weekdays, [ weekdays.shift() ] ) : weekdays;
	}

	/**
	 * @return {void}
	 */
	public formatDateInput() {
		const cleanDateInput: string = this.dateInputRef.value?.replace( /[^0-9]/g, '' );

		if ( !cleanDateInput.length ) {
			this.pickedDate = null;

			this._updateCalendar();
			return;
		}

		let dateInput: string = cleanDateInput.substring( 0, 2 );

		if ( dateInput.length === 2 ) dateInput += '/';

		dateInput += cleanDateInput.substring( 2, 4 );

		if ( dateInput.length === 5 ) dateInput += `/${cleanDateInput.substring( 4 )}`;

		dateInput = dateInput.substring( 0, 10 );

		this.dateFormControl.setValue( dateInput );

		if ( this.dateFormControl.valid ) {
			this.pickedDate = moment( dateInput, this.dateFormat );
			return;
		}

		this._pickedDate = null;

		this._updateCalendar();
	}

	/**
	 * @return {void}
	 */
	public displayPreviousMonth() {
		this.displayingMoment.subtract( 1, 'M' );
		this.displayMonth();
	}

	/**
	 * @return {void}
	 */
	public displayNextMonth() {
		this.displayingMoment.add( 1, 'M' );
		this.displayMonth();
	}

	/**
	 * @param {number} year
	 * @param {number} month
	 * @return {void}
	 */
	public displayMonth( year?: number, month?: number ) {
		year >= 0 && this.displayingMoment.year( year );
		month >= 0 && this.displayingMoment.month( month );

		this.displayingYear = this.displayingMoment.year();
		this.displayingMonth = this.displayingMoment.month();

		this._initCalendar();
	}

	/**
	 * @param {number} year
	 * @param {number} month
	 * @param {number} date
	 * @return {void}
	 */
	public pickDate( year: number, month: number, date: number ) {
		const pickedDate: Moment = this.currentMoment.clone().year( year ).month( month ).date( date );

		if ( this.dateRange ) {
			const startDate: Moment = _.nth( this.pickedDate as Moment[], 0 );
			const endDate: Moment = _.nth( this.pickedDate as Moment[], 1 );

			if ( !startDate || ( startDate && endDate ) ) {
				this.pickedDate = [ pickedDate.startOf( 'd' ) ];
			} else if ( pickedDate.isSameOrBefore( startDate ) ) {
				this.pickedDate = [ pickedDate.startOf( 'd' ), startDate.endOf( 'd' ) ];
			} else {
				this.pickedDate = [ startDate, pickedDate.endOf( 'd' ) ];
			}

			if ( this.maxDateRange ) {
				const matched: any = this.maxDateRange.match( /(\d+)(\S+)/i );

				this.tempMinDate = _.nth( this.pickedDate, 0 ).clone().subtract( matched[ 1 ], matched[ 2 ] );
				this.tempMaxDate = _.nth( this.pickedDate, 0 ).clone().add( matched[ 1 ], matched[ 2 ] );
				this.tempMinDate = !this.minDate || this.tempMinDate.isAfter( this.minDate )
					? this.tempMinDate.startOf( 'd' )
					: this.minDate?.clone();
				this.tempMaxDate = !this.maxDate || this.tempMaxDate.isBefore( this.maxDate )
					? this.tempMaxDate.startOf( 'd' )
					: this.maxDate?.clone();
			}

			this._updateCalendar();
			this.pickedDate.length === 2 && this._done();
			return;
		}

		this.pickedDate = pickedDate;

		this.displayMonth( year, month );
	}

	/**
	 * @param {number} hour
	 * @param {number} minute
	 * @return {void}
	 */
	public setTime( hour: number, minute: number ) {
		if ( this.dateRange ) return;

		this.pickedDate = moment( this.pickedDate as Moment || undefined );
		this.pickedDate = this.minDate && this.pickedDate.isBefore( this.minDate ) ? this.minDate.clone() : this.pickedDate;
		this.pickedDate = this.maxDate && this.pickedDate.isAfter( this.maxDate ) ? this.maxDate.clone() : this.pickedDate;
		this.pickedTime = this.pickedTime.clone();

		this.pickedTime.hour( hour );
		this.pickedTime.minute( minute );

		this._updateCalendar();
	}

	/**
	 * @return {void}
	 */
	public save() {
		this._done();
		this.close?.();
	}

	/**
	 * @return {void}
	 */
	public clear() {
		this.pickedDate = null;
		this.showTime = false;

		this._updateCalendar();
		this.dateRange && this._done();
	}

	/**
	 * @return {void}
	 */
	private _done() {
		let pickedEvent: WGCIDatePickerPickedEvent;

		if ( this.dateRange ) {
			pickedEvent = { range: this.pickedDate as Moment[] };
		} else if ( !_.isArray( this.pickedDate ) ) {
			const pickedDate: Moment = ( this.pickedDate as Moment );

			if ( pickedDate ) {
				if ( !this.showTime ) {
					pickedDate.startOf( 'd' );
				} else {
					pickedDate.hour( ( this.pickedTime as Moment ).hour() );
					pickedDate.minute( ( this.pickedTime as Moment ).minute() );
				}
			}

			pickedEvent = { date: pickedDate, showTime: this.showTime };
		}

		this.picked.emit( pickedEvent );
		_.isFunction( this.onPicked ) && this.onPicked( pickedEvent );
	}

	/**
	 * @return {void}
	 */
	private _initCalendar() {
		const endDateOfPrevMonth: number = +this.displayingMoment.clone().subtract( 1, 'M' ).endOf( 'M' ).date();
		const startOfMonth: Moment = this.displayingMoment.clone().startOf( 'M' );
		const endOfMonth: Moment = this.displayingMoment.clone().endOf( 'M' );
		const dateInMonth: WGCIDateInMonth[] = _.map(
			_.range( startOfMonth.date(), endOfMonth.date() + 1 ),
			( date: number ) => ({ year: this.displayingYear, month: this.displayingMonth, date })
		);
		let dayStartOfMonth: number = startOfMonth.day();
		let dayEndOfMonth: number = endOfMonth.day();

		if ( this.weekStart === 1 ) {
			dayStartOfMonth--;
			dayEndOfMonth--;

			if ( dayStartOfMonth === -1 ) dayStartOfMonth = 6;
			if ( dayEndOfMonth === -1 ) dayEndOfMonth = 6;
		}

		for ( let i: number = 0; i < dayStartOfMonth; i++ ) {
			const year: number = this.displayingMonth > 0 ? this.displayingYear : this.displayingYear - 1;
			const month: number = this.displayingMonth > 0 ? this.displayingMonth - 1 : 11;
			const date: number = endDateOfPrevMonth - i;

			dateInMonth.unshift({ year, month, date });
		}

		for ( let i: number = 1; i < 7 - dayEndOfMonth; i++ ) {
			const year: number = this.displayingMonth < 12 ? this.displayingYear : this.displayingYear + 1;
			const month: number = this.displayingMonth < 12 ? this.displayingMonth + 1 : 0;
			const date: number = i;

			dateInMonth.push({ year, month, date });
		}

		this.dateInMonth = dateInMonth;

		this._updateCalendar();
	}

	/**
	 * @return {void}
	 */
	private _updateCalendar() {
		this.dateInMonth = _.map(
			this.dateInMonth,
			( item: WGCIDateInMonth ): WGCIDateInMonth => ({ ...item, ...this._getDateStates( item ) })
		);
	}

	/**
	 * @param {WGCIDateInMonth} dateInMonth
	 * @return {WGCIDateInMonthState}
	 */
	private _getDateStates( dateInMonth: WGCIDateInMonth ): WGCIDateInMonthState {
		const year: number = dateInMonth.year;
		const month: number = dateInMonth.month;
		const date: number = dateInMonth.date;
		const dateMoment: Moment = this.currentMoment
		.clone()
		.year( year )
		.month( month )
		.date( date )
		.startOf( 'd' );
		const today: boolean = year === this.currentMoment.year()
			&& month === this.currentMoment.month()
			&& date === this.currentMoment.date();
		const minDate: Moment = this.tempMinDate || this.minDate;
		const maxDate: Moment = this.tempMaxDate || this.maxDate;
		const disabled: boolean = ( minDate && dateMoment.isBefore( minDate ) )
			|| ( maxDate && dateMoment.isAfter( maxDate ) );
		let picked: boolean = false;
		let inRange: boolean = false;

		if ( this.pickedDate ) {
			if ( this.dateRange ) {
				const startDate: Moment = _.nth( this.pickedDate as Moment[], 0 );
				const endDate: Moment = _.nth( this.pickedDate as Moment[], 1 );

				picked = ( year === startDate?.year() && month === startDate?.month() && date === startDate?.date() )
					|| ( year === endDate?.year() && month === endDate?.month() && date === endDate?.date() );
				inRange = startDate
					&& endDate
					&& dateMoment.isSameOrAfter( startDate )
					&& dateMoment.isSameOrBefore( endDate );
			} else if ( !_.isArray( this.pickedDate ) ) {
				picked = year === ( this.pickedDate as Moment ).year()
					&& month === ( this.pickedDate as Moment ).month()
					&& date === ( this.pickedDate as Moment ).date();
			}
		}

		return { today, disabled, picked, inRange };
	}

}
