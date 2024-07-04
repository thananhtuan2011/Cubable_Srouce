/* eslint-disable @typescript-eslint/naming-convention */
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	inject,
	OnInit,
	ChangeDetectorRef
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBDate,
	CUBTime
} from '@cub/material/date-picker';

import {
	ScheduleType,
	TriggerType
} from '../resources';
import {
	AtScheduleTimeSetting
} from '../interfaces/schedule.interface';

import {
	TriggerBase
} from './trigger-base';

type ScheduleInfo = {
	name: string;
	value: ScheduleType;
};

type DayInfo = {
	name: string;
	value: number;
	isActive: boolean;
};

enum CalendarType {
	DAY_OF_WEEK = 1,
	MONTH,
	DAY_OF_MONTH,
}

const scheduleType: ReadonlySet<ScheduleInfo>
	= new Set([
		setScheduleInfo(
			ScheduleType.NONE,
			'NONE'
		),
		setScheduleInfo(
			ScheduleType.DAILY,
			'DAILY'
		),
		setScheduleInfo(
			ScheduleType.WEEKLY,
			'WEEKLY'
		),
		setScheduleInfo(
			ScheduleType.MONTHLY,
			'MONTHLY'
		),
		setScheduleInfo(
			ScheduleType.YEARLY,
			'YEARLY'
		),
	]);

function setScheduleInfo(
	value: ScheduleType,
	name: string
): ScheduleInfo {
	return {
		value,
		name,
	};
}

@Unsubscriber()
@Component({
	selector: 'at-scheduled-time',
	templateUrl: '../templates/at-scheduled-time.pug',
	styleUrls: [ '../styles/at-scheduled-time.scss' ],
	host: { class: 'at-scheduled-time' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtScheduledTimeComponent
	extends TriggerBase
	implements OnInit {

	@ViewChild( 'scheduleTypePicker' )
	public scheduleTypePicker: CUBDropdownComponent;

	@Input() public settings: AtScheduleTimeSetting;
	@Input() public triggerType: TriggerType;

	@Output() public settingsChange: EventEmitter<AtScheduleTimeSetting>
		= new EventEmitter<AtScheduleTimeSetting>();

	protected readonly SCHEDULE_ACTION_TYPE: typeof ScheduleType
		= ScheduleType;
	protected readonly CALENDAR_TYPE: typeof CalendarType
		= CalendarType;
	public readonly dateFromControl: FormControl
		= new FormControl( undefined );
	public readonly selectDateControl: FormControl
		= new FormControl( undefined );
	public readonly selectTimeControl: FormControl
		= new FormControl( undefined );

	protected readonly SCHEDULE_TYPE: ReadonlySet<ScheduleInfo>
		= scheduleType;
	protected readonly typeControl: FormControl
		= new FormControl( undefined );

	protected dayOfWeekArray: DayInfo[];
	protected dayOfMonthArray: DayInfo[];
	protected months: DayInfo[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnInit() {
		if (
			this.settings.type
			=== this.SCHEDULE_ACTION_TYPE.WEEKLY
		) {
			this._initDay(
				this.CALENDAR_TYPE.DAY_OF_WEEK,
				( this.settings.scheduleDetail as any ).selectDayOfWeek,
				undefined
			);
		}

		if (
			this.settings.type
			=== this.SCHEDULE_ACTION_TYPE.MONTHLY
		) {
			this._initDay(
				this.CALENDAR_TYPE.DAY_OF_MONTH,
				( this.settings.scheduleDetail as any ).selectDayOfMonth,
				undefined
			);
		}

		if (
			this.settings.type
			=== this.SCHEDULE_ACTION_TYPE.YEARLY
		) {
			this._initDay(
				this.CALENDAR_TYPE.MONTH,
				( this.settings.scheduleDetail as any ).selectMonth,
				undefined
			);
			this._initDay(
				this.CALENDAR_TYPE.DAY_OF_MONTH,
				( this.settings.scheduleDetail as any ).selectDayOfMonth,
				undefined
			);
		}
	}

	/**
	 * @param {number} _type
	 * @return {void}
	 */
	protected onScheduleTypeChange( _type: number ) {
		if ( this.settings.type === _type ) return;

		this.settings ||= {};

		this.settings = {
			type: _type,
			scheduleDetail: {},
		};

		switch ( _type ) {
			case this.SCHEDULE_ACTION_TYPE.WEEKLY:
				this._resetDay( this.dayOfWeekArray );
				this._initDay(
					this.CALENDAR_TYPE.DAY_OF_WEEK,
					undefined,
					this.dayOfWeekArray
				);
				break;
			case this.SCHEDULE_ACTION_TYPE.MONTHLY:
				this._resetDay( this.dayOfMonthArray );
				this._initDay(
					this.CALENDAR_TYPE.DAY_OF_MONTH,
					undefined,
					this.dayOfMonthArray
				);
				break;
			case this.SCHEDULE_ACTION_TYPE.YEARLY:
				this._resetDay( this.months );
				this._resetDay( this.dayOfMonthArray );
				this._initDay(
					this.CALENDAR_TYPE.MONTH,
					undefined,
					this.months
				);
				this._initDay(
					this.CALENDAR_TYPE.DAY_OF_MONTH,
					undefined,
					this.dayOfMonthArray
				);

				break;
		}

		this.settingsChange.emit( this.settings );
		this._cdRef.markForCheck();
	}

	/**
	 * @param {CUBDate} _date
	 * @return {void}
	 */
	protected onSelectedDate( _date: CUBDate ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			date: _date,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {DayInfo} dayOfWeek
	 * @return {void}
	 */
	protected onSelectDayOfWeek( dayOfWeek: DayInfo ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			selectDayOfWeek: dayOfWeek.value,
		};

		_.forEach( this.dayOfWeekArray, ( d: DayInfo ) => {
			d.isActive = d.value === dayOfWeek.value;
		} );

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {DayInfo} dayOfWeek
	 * @return {void}
	 */
	protected onSelectMonth( m: DayInfo ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			selectMonth: m.value,
		};

		_.forEach( this.months, ( _m: DayInfo ) => {
			_m.isActive = _m.value === m.value;
		} );

		this._checkDayOfMonth( m.value );

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {DayInfo} dayOfWeek
	 * @return {void}
	 */
	protected onSelectDayOfMonth( day: DayInfo ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			selectDayOfMonth: day.value,
		};

		_.forEach( this.dayOfMonthArray, ( d: DayInfo ) => {
			d.isActive = d.value === day.value;
		} );

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onSelectLastDayOfMonth() {
		_.forEach( this.dayOfMonthArray, ( d: DayInfo ) => {
			if ( !d.isActive ) return;

			d.isActive = false;

			return false;
		} );

		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			lastDayOfMonth: true,
			selectDayOfMonth: undefined,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {Moment} date
	 * @return {void}
	 */
	protected onSelectedDateFrom( date: CUBDate ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			dateFrom: date,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {CUBTime} _time
	 * @return {void}
	 */
	protected onTimeChanged( _time: CUBTime ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			time: _time,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {boolean} value
	 * @return {void}
	 */
	protected onSwitchChange( value: boolean ) {
		this.settings.scheduleDetail ||= {};

		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			notApplyWeekend: value,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {number} month
	 * @return {void}
	 */
	private _checkDayOfMonth( month: number ) {
		const condition1: boolean
			= month === 1
			|| month === 3
			|| month === 5
			|| month === 7
			|| month === 8
			|| month === 10
			|| month === 12;
		const condition2: boolean
			= month === 4
			|| month === 6
			|| month === 9
			|| month === 11;

		if ( this.dayOfMonthArray.length === 29 ) {
			if ( condition1 ) {
				this.dayOfMonthArray.push(
					{
						name: '30',
						value: 30,
						isActive: false,
					},
					{
						name: '31',
						value: 31,
						isActive: false,
					}
				);
			}
			if ( condition2 ) {
				this.dayOfMonthArray.push({
					name: '30',
					value: 30,
					isActive: false,
				});
			}
		}

		if ( month === 2 ) {
			this.dayOfMonthArray.length = 29;
		}

		if ( condition2 ) {
			this.dayOfMonthArray.length = 30;
		}

		if ( condition1 ) {
			this.dayOfMonthArray.push({
				name: '31',
				value: 31,
				isActive: false,
			});

			this.dayOfMonthArray = _.uniqBy( this.dayOfMonthArray, 'value' );
		}
	}

	/**
	 * @param {CalendarType} type
	 * @param {number} selectedValue
	 * @param {DayInfo[]} arr
	 * @return {void}
	 */
	private _initDay(
		type: CalendarType,
		selectedValue: number,
		arr?: DayInfo[]
	) {
		if ( !arr?.length ) {
			const _arr: DayInfo[] = [];
			let count: number;

			switch ( type ) {
				case this.CALENDAR_TYPE.DAY_OF_WEEK:
					count = 7;
					break;
				case this.CALENDAR_TYPE.DAY_OF_MONTH:
					count = 31;
					break;
				case this.CALENDAR_TYPE.MONTH:
					count = 12;
					break;
			}

			for ( let i: number = 1; i <= count; i++ ) {
				_arr.push({
					name: this._generateName( i, type ),
					value: i,
					isActive: false,
				});
			}

			if ( selectedValue ) {
				_arr[ selectedValue - 1 ].isActive = true;
			} else {
				_arr[ 0 ].isActive = true;
			};

			switch ( type ) {
				case this.CALENDAR_TYPE.DAY_OF_WEEK:
					this.dayOfWeekArray = _arr;
					break;
				case this.CALENDAR_TYPE.DAY_OF_MONTH:
					this.dayOfMonthArray = _arr;
					break;
				case this.CALENDAR_TYPE.MONTH:
					this.months = _arr;
					break;
			}
		}

		if ( selectedValue ) return;

		this._assignScheduleDetail( type );
	}

	/**
	 * @param {DayInfo[]} dayArr
	 * @return {void}
	 */
	private _resetDay( dayArr: DayInfo[] ) {
		const index: number
			= _.findIndex(
				dayArr,
				{ isActive: true }
			);

		if ( index > -1 && index !== 0 ) {
			dayArr[ index ].isActive = false;

			dayArr[ 0 ].isActive = true;
		}
	}

	/**
	 * @param {number} i
	 * @param {CalendarType} type
	 * @return {void}
	 */
	private _generateName(
		i: number,
		type: CalendarType
	): string {
		let name: string;

		switch ( type ) {
			case this.CALENDAR_TYPE.DAY_OF_WEEK:
				name = i === 7
					? 'CN'
					: 'T' + ( i + 1 );
				break;
			case this.CALENDAR_TYPE.DAY_OF_MONTH:
				name = i < 10 ? '0' + i : i.toString();
				break;
			case this.CALENDAR_TYPE.MONTH:
				name = i.toString();
				break;
		}

		return name;
	}

	/**
	 * @param {CalendarType} type
	 * @return {void}
	 */
	private _assignScheduleDetail( type: CalendarType ) {
		this.settings.scheduleDetail = {
			...this.settings.scheduleDetail,
			selectDayOfWeek:
				type === this.CALENDAR_TYPE.DAY_OF_WEEK
					? 1
					: undefined,
			selectDayOfMonth:
				type === this.CALENDAR_TYPE.DAY_OF_MONTH
					? 1
					: undefined,
			selectMonth:
				type === this.CALENDAR_TYPE.MONTH
					? 1
					: undefined,
		};
	}

}
