import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
	inject
} from '@angular/core';
import {
	FormBuilder,
	FormGroup
} from '@angular/forms';
import moment, {
	isMoment,
	Moment
} from 'moment-timezone';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUBFormFieldComponent
} from '../../form-field';
import {
	CUBMenuComponent,
	CUBMenuRef,
	CUBMenuService
} from '../../menu';

export type CUBDate = Moment;

export const isCUBDate: typeof isMoment = isMoment;
export const createCUBDate: typeof moment = moment;

type CalendarDate = {
	date: number;
	month: number;
	year: number;
	picked?: boolean;
	today?: boolean;
	inRange?: boolean;
};

type CalendarDateState = Pick<CalendarDate, 'today' | 'picked' | 'inRange'>;

const MAX_RANGE: number = 42;
const TIME_FORMAT: string = 'HH:mm';
const TIME_SPLIT_REGEXP: RegExp = /:|h|g/i;
const YEARS: number[] = _.range( 1900, 2100 );
const MONTHS: string[] = moment.months();
const WEEKDAYS: string[] = moment.weekdaysShort();
const TIMES: string[] = _.map(
	_.range( 0, 48 ),
	( i: number ) => {
		const hour: string = _.padStart(
			String( Math.floor( i / 2 ) ),
			2,
			'0'
		);
		const minute: string = _.padStart(
			String( i % 2 === 0 ? 0 : 30 ),
			2,
			'0'
		);

		return `${hour}:${minute}`;
	}
);

const createCalendar: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			year: number,
			month: number
		): CalendarDate[] {
			const currentMonth: CUBDate
				= moment()
				.year( year )
				.month( month );
			const endOfMonth: CUBDate
				= currentMonth
				.clone()
				.endOf( 'month' );
			const edpm: number
				= currentMonth
				.clone()
				.subtract( 1, 'month' )
				.endOf( 'month' )
				.date();
			const edcm: number
				= endOfMonth.date();
			const start: number
				= 1 - currentMonth
				.clone()
				.startOf( 'month' )
				.day();
			const end: number
				= edcm + ( 7 - ( endOfMonth.day() + 1 ) );
			const calendar: CalendarDate[] = [];

			for ( let i: number = 0; i < MAX_RANGE; i++ ) {
				let calendarDate: CalendarDate = calendar[ i ];

				if ( !calendarDate ) {
					calendarDate
						= calendar[ i ]
						= {} as CalendarDate;
				}

				const s: number = start + i;

				if ( s > end ) continue;

				let y: number = year;
				let m: number = month;
				let d: number = s;

				if ( s <= 0 ) {
					if ( month === 0 ) y = year - 1;
					m = month - 1;
					d = edpm + s;
				} else if ( s > edcm ) {
					if ( month === 11 ) y = year + 1;
					m = month + 1;
					d = s % edcm;
				}

				calendarDate.year = y;
				calendarDate.month = m;
				calendarDate.date = d;
			}

			return _.filter(
				calendar,
				( calendarDate: CalendarDate ) => !_.isEmpty( calendarDate )
			);
		},
		function(
			year: number,
			month: number
		): string {
			return year
				+ '|'
				+ month;
		}
	);

const createDateFromString: ReturnType<typeof _.memoize>
	= _.memoize(
		function( value: string ): CUBDate {
			if ( !value?.length ) return;

			const date: CUBDate = moment( value );

			if ( !date.isValid() ) return;

			return date;
		}
	);

function createDate(
	value: string | CUBDate
): CUBDate {
	let date: CUBDate = value as CUBDate;

	if ( !isCUBDate( date ) ) {
		date = createDateFromString( date );
	}

	if ( !date?.isValid() ) return;

	return date;
}

@Component({
	selector		: 'cub-date-picker',
	templateUrl		: './date-picker.pug',
	styleUrls		: [ './date-picker.scss' ],
	host			: { class: 'cub-date-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBDatePickerComponent implements OnChanges, OnInit {

	@Input() @CoerceBoolean()
	public dateOnly: boolean;
	@Input() @CoerceBoolean()
	public dateRange: boolean;
	@Input() @CoerceBoolean()
	public dateRangeInput: boolean;
	@Input() @CoerceBoolean()
	public dateRangeValue: CUBDate[];
	@Input() @DefaultValue() @CoerceBoolean()
	public canManualChange: boolean = true;

	@Output() public yearSelected: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public monthSelected: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public calendarChanged: EventEmitter<
		{ year: number; month: number }
	> = new EventEmitter<{ year: number; month: number }>();
	@Output() public pickedChange: EventEmitter<CUBDate>
		= new EventEmitter<CUBDate>();
	@Output() public dateRangeValueChange: EventEmitter<CUBDate[]>
		= new EventEmitter<CUBDate[]>();

	@ViewChild( 'timeMenu', { static: true } )
	protected readonly timeMenu: CUBMenuComponent;
	@ViewChild( 'timeFormField' )
	protected readonly timeFormField: CUBFormFieldComponent;

	public isShowInvalidState: boolean;

	protected readonly regExp: RegExp = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
	protected readonly YEARS: number[] = YEARS;
	protected readonly MONTHS: string[] = MONTHS;
	protected readonly WEEKDAYS: string[] = WEEKDAYS;
	protected readonly TIMES: string[] = TIMES;

	protected dateForm: FormGroup;
	protected isStartLater: boolean;
	protected isEndEarlier: boolean;
	protected pickedYear: number | number[];
	protected pickedMonth: number | number[];
	protected pickedDate: number | number[];
	protected pickedTime: string;
	protected currentYear: number;
	protected currentMonth: number;
	protected currentDate: number;
	protected currentTime: string;
	protected minYear: number;
	protected minMonth: number;
	protected minDate: number;
	protected minTime: string;
	protected maxYear: number;
	protected maxMonth: number;
	protected maxDate: number;
	protected maxTime: string;
	protected onStartDateChangeDebounce: _.DebouncedFunc<() => void>
		= _.debounce( () => this._onStartDateChange(), 600 );
	protected onEndDateChangeDebounce: _.DebouncedFunc<() => void>
		= _.debounce( () => this._onEndDateChange(), 300 );
	protected calendarToday: CalendarDate;
	protected calendar: CalendarDate[]
		= Array<CalendarDate>( MAX_RANGE );

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	private _timeMenuRef: CUBMenuRef;
	private _picked: CUBDate | CUBDate[];
	private _current: CUBDate;
	private _min: CUBDate;
	private _max: CUBDate;

	@Input()
	get picked(): CUBDate | CUBDate[] {
		return this._picked;
	}
	set picked( value: string | CUBDate | CUBDate[] ) {
		if ( this.dateRange && value ) {
			this._picked
				= [ createDate( value[ 0 ] ), createDate( value[ 1 ] ) ];

			this.pickedYear ||= [];
			this.pickedMonth ||= [];
			this.pickedDate ||= [];

			if ( _.nth( this._picked as CUBDate[], 0 ) ) {
				this._picked[ 0 ] = moment( this._picked[ 0 ] ).startOf( 'd' );

				this.pickedYear[ 0 ]
					= _.nth( this._picked as CUBDate[], 0 )?.year();
				this.pickedMonth[ 0 ]
					= _.nth( this._picked as CUBDate[], 0 )?.month();
				this.pickedDate[ 0 ]
					= _.nth( this._picked as CUBDate[], 0 )?.date();
			}

			if ( _.nth( this._picked as CUBDate[], 1 ) ) {
				this._picked[ 1 ] = moment( this._picked[ 1 ] ).endOf( 'd' );

				this.pickedYear[ 1 ]
					= _.nth( this._picked as CUBDate[], 1 )?.year();
				this.pickedMonth[ 1 ]
					= _.nth( this._picked as CUBDate[], 1 )?.month();
				this.pickedDate[ 1 ]
					= _.nth( this._picked as CUBDate[], 1 )?.date();
			}

		} else if ( !_.isArray( this._picked ) ) {
			value = createDate( value as string | CUBDate );

			this._picked = value;

			this.pickedYear = value?.year();
			this.pickedMonth = value?.month();
			this.pickedDate = value?.date();
			this.pickedTime = value?.format( TIME_FORMAT );
		}

		this._picked && this._renderPickedCalendar();
	}

	@Input()
	get current(): CUBDate {
		return this._current;
	}
	set current( value: string | CUBDate ) {
		value = createDate( value );

		this._current = value;

		this.currentYear = value?.year();
		this.currentMonth = value?.month();
		this.currentDate = value?.date();
		this.currentTime = value?.format( TIME_FORMAT );
	}

	@Input()
	get min(): CUBDate {
		return this._min;
	}
	set min( value: string | CUBDate ) {
		value = createDate( value );

		this._min = value;

		this.minYear = value?.year();
		this.minMonth = value?.month();
		this.minDate = value?.date();
		this.minTime = value?.format( TIME_FORMAT );
	}

	@Input()
	get max(): CUBDate {
		return this._max;
	}
	set max( value: string | CUBDate ) {
		value = createDate( value );

		this._max = value;

		this.maxYear = value?.year();
		this.maxMonth = value?.month();
		this.maxDate = value?.date();
		this.maxTime = value?.format( TIME_FORMAT );
	}

	get isTimeAdded(): boolean {
		return !this.dateOnly
			&& this.pickedTime
			&& this.pickedTime !== '00:00';
	}

	get startDate(): CUBDate {
		return this.dateForm.controls.startDate.value;
	}

	get endDate(): CUBDate {
		return this.dateForm.controls.endDate.value;
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.dateRangeValue?.currentValue ) {
			this.picked = changes.dateRangeValue.currentValue;

			this._checkStartDateValue();
			this._checkEndDateValue();
		}
	}

	ngOnInit() {
		this.dateForm = this._fb.group({
			startDate: undefined,
			endDate: undefined,
		});

		this.current = moment();

		this.calendarToday = {
			year: this.current.year(),
			month: this.current.month(),
			date: this.current.date(),
		};

		this._renderCalendar(
			this.currentYear,
			this.currentMonth,
			false
		);

		if ( this.isShowInvalidState ) {
			this.dateForm.controls.startDate.markAsDirty();
			this.dateForm.controls.endDate.markAsDirty();
		}
	}

	/**
	 * @param {HTMLInputElement} timeInput
	 * @return {void}
	 */
	protected onTimeInputTyping(
		timeInput: HTMLInputElement
	) {
		if ( timeInput.value.length !== 5 ) return;

		this.convertTimeString( timeInput );
	}

	/**
	 * @param {HTMLInputElement} timeInput
	 * @return {void}
	 */
	protected onTimeInputBlur(
		timeInput: HTMLInputElement
	) {
		this.convertTimeString( timeInput );

		// setTimeout(
		// 	() => this._timeMenuRef?.close(),
		// 	100
		// );
	}

	/**
	 * @return {void}
	 */
	protected openTimeMenu() {
		if ( this._timeMenuRef?.isOpened ) return;

		this._timeMenuRef = this._menuService.open(
			this.timeFormField.container,
			this.timeMenu,
			undefined,
			{ viewContainerRef: this._vcRef }
		);
	}

	/**
	 * @param {number} year
	 * @return {void}
	 */
	protected selectYear( year: number ) {
		this.current = this.current
		.clone()
		.year( year );

		this.yearSelected.emit( year );

		this._renderCalendar();
	}

	/**
	 * @param {number} month
	 * @return {void}
	 */
	protected selectMonth( month: number ) {
		this.current = this.current
		.clone()
		.month( month );

		this.monthSelected.emit( month );

		this._renderCalendar();
	}

	/**
	 * @param {CalendarDate} calendarDate
	 * @return {void}
	 */
	protected pickDate(
		calendarDate: CalendarDate
	) {
		const picked: CUBDate
			= moment()
			.year( calendarDate.year )
			.month( calendarDate.month )
			.date( calendarDate.date );

		if ( this.dateRange ) {
			const startDate: CUBDate = _.nth( this.picked as CUBDate[], 0 );
			const endDate: CUBDate = _.nth( this.picked as CUBDate[], 1 );

			let rangePicked: CUBDate[];

			if ( !startDate || ( startDate && endDate ) ) {
				rangePicked = [ picked.startOf( 'd' ) ];
			} else if ( picked.isSameOrBefore( startDate ) ) {
				rangePicked = [ picked.startOf( 'd' ), startDate.endOf( 'd' ) ];
			} else {
				rangePicked = [ startDate, picked.endOf( 'd' ) ];
			}

			this.dateRangeValueChange.emit(
				this.picked = rangePicked
			);

			this._updateCalendar();
		} else {
			if ( this.isTimeAdded ) {
				picked.hour( ( this.picked as CUBDate ).hour() );
				picked.minute( ( this.picked as CUBDate ).minute() );
				picked.second( 0 );
			} else {
				picked.startOf( 'day' );
			}

			this.pickedChange.emit(
				this.picked = picked
			);
		}
	}

	/**
	 * @param {string=} time
	 * @return {void}
	 */
	protected pickTime( time?: string ) {
		const picked: CUBDate
			= moment().second( 0 );

		if ( this.picked ) {
			picked
			.year( ( this.picked as CUBDate ).year() )
			.month( ( this.picked as CUBDate ).month() )
			.date( ( this.picked as CUBDate ).date() );
		}

		if ( time === null ) {
			picked.startOf( 'day' );
		} else if ( time !== undefined ) {
			const [ hour, minute ]: string[]
				= time.split( TIME_SPLIT_REGEXP );

			picked
			.hour( parseInt( hour, 10 ) || 0 )
			.minute( parseInt( minute, 10 ) || 0 );
		}

		this.pickedChange.emit(
			this.picked = picked
		);
	}

	/**
	 * @return {void}
	 */
	protected selectPreviousMonth() {
		this.current = this.current
		.clone()
		.subtract( 1, 'month' );

		this._renderCalendar();
	}

	/**
	 * @return {void}
	 */
	protected selectNextMonth() {
		this.current = this.current
		.clone()
		.add( 1, 'month' );

		this._renderCalendar();
	}

	/**
	 * @param {HTMLInputElement} timeInput
	 * @return {void}
	 */
	protected convertTimeString(
		timeInput: HTMLInputElement
	) {
		if ( !moment( timeInput.value, TIME_FORMAT ).isValid() ) {
			timeInput.value = this.pickedTime;
			return;
		}

		this.pickTime( timeInput.value );
	}

	/**
	 * @return {void}
	 */
	private _renderPickedCalendar() {
		if ( !this.dateRange
			&& this.pickedYear === this.currentYear
			&& this.pickedMonth === this.currentMonth ) {
			return;
		}

		this.current
			= this.dateRange
				? this.picked[ 0 ].clone()
				: ( this.picked as CUBDate ).clone();

		this._renderCalendar();
	}

	/**
	 * @param {number=} year
	 * @param {number=} month
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	private _renderCalendar(
		year: number = this.currentYear,
		month: number = this.currentMonth,
		emitEvent: boolean = true
	) {
		this.calendar = createCalendar( year, month );

		this._updateCalendar();

		this._cdRef.markForCheck();

		if ( !emitEvent ) return;

		this.calendarChanged.emit({
			year,
			month,
		});
	}

	/**
	 * @return {void}
	 */
	private _updateCalendar() {
		this.calendar = _.map(
			this.calendar,
			( calendarDate: CalendarDate ): CalendarDate => ({
				...calendarDate,
				...this._getDateStates( calendarDate ),
			})
		);
	}

	/**
	 * @param {CalendarDate} dateInMonth
	 * @return {CalendarDateState}
	 */
	private _getDateStates( dateInMonth: CalendarDate ): CalendarDateState {
		if ( !dateInMonth ) return;

		const year: number = dateInMonth.year;
		const month: number = dateInMonth.month;
		const date: number = dateInMonth.date;

		if ( !( year && date && ( month || month === 0 ) ) ) return;

		const dateMoment: CUBDate
			= this._current
			.clone()
			.year( year )
			.month( month )
			.date( date )
			.startOf( 'd' );
		const today: boolean
			= year === this._current.year()
				&& month === this._current.month()
				&& date === this._current.date();
		let picked: boolean = false;
		let inRange: boolean = false;

		if ( this.dateRange ) {
			const startDate: CUBDate = _.nth( this.picked as CUBDate[], 0 );
			const endDate: CUBDate = _.nth( this.picked as CUBDate[], 1 );

			picked
				= ( year === startDate?.year()
					&& month === startDate?.month()
					&& date === startDate?.date() )
				|| ( year === endDate?.year()
					&& month === endDate?.month()
					&& date === endDate?.date() );

			inRange = startDate
				&& endDate
				&& dateMoment.isSameOrAfter( startDate )
				&& dateMoment.isSameOrBefore( endDate );
		} else {
			if ( this.picked ) {
				picked = year === ( this.picked as CUBDate ).year()
					&& month === ( this.picked as CUBDate ).month()
					&& date === ( this.picked as CUBDate ).date();
			} else {
				picked = false;
			}
		}

		return { today, picked, inRange };
	}

	/**
	 * @return {void}
	 */
	private _checkStartDateValue() {
		this.isStartLater = false;
		this.isEndEarlier = false;

		if ( this.picked[ 0 ] >= this.picked[ 1 ] ) {
			this.isStartLater = true;
		};
	}

	/**
	 * @return {void}
	 */
	private _checkEndDateValue() {
		this.isStartLater = false;
		this.isEndEarlier = false;

		if ( this.picked[ 1 ] <= this.picked[ 0 ] ) {
			this.isEndEarlier = true;
		};
	}

	/**
	 * @return {void}
	 */
	private _onStartDateChange() {
		const startInput: string
			= this.dateForm.controls.startDate.value;

		if ( startInput.length < 10 ) return;

		const startMoment: CUBDate
			= moment( startInput, 'DD/MM/YYYY', false );

		if ( !startMoment.isValid() ) return;

		if ( this.picked ) {
			this.picked[ 0 ] = startMoment;
		} else {
			this.picked = [ startMoment ];
		}

		this._checkStartDateValue();

		this.dateRangeValueChange.emit(
			this.picked = _.clone( this.picked ) as CUBDate[]
		);
	}

	/**
	 * @return {void}
	 */
	private _onEndDateChange() {
		this.isStartLater = false;
		this.isEndEarlier = false;

		const endInput: string
			= this.dateForm.controls.endDate.value;

		if ( endInput.length < 10 ) return;

		const endMoment: CUBDate
			= moment( endInput, 'DD/MM/YYYY', false );

		if ( !endMoment.isValid() ) return;

		if ( (this.picked as CUBDate[] ).length === 2 ) {
			this.picked[ 1 ] = endMoment;
		} else {
			( this.picked as CUBDate[] ).push( endMoment );
		}

		this._checkEndDateValue();

		this.dateRangeValueChange.emit(
			this.picked = _.clone( this.picked ) as CUBDate[]
		);
	}
}
