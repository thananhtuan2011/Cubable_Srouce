import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	inject,
	OnInit
} from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	FormControl,
	Validators
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBFormFieldComponent,
	CUBFormFieldInputDirective
} from '@cub/material/form-field';
import {
	CUBTimePickerDirective
} from '@cub/material/date-picker';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	DataType
} from '@main/common/field/interfaces';

import {
	WorkflowService
} from '../../../../../services';

import {
	DateArrivesSetting,
	DateEvent,
	ScheduleEvent,
	TimeGap
} from '../interfaces';
import {
	EventDay,
	PositionTime,
	FrequencyTime,
	RowTriggerType,
	TypeTimeOption
} from '../resources';
import {
	TriggerBase
} from './trigger-base';

type FieldEventInfo = {
	name: string;
	value: EventDay;
};

function setFieldEventInfo(
	value: EventDay,
	name: string
): FieldEventInfo {
	return {
		value,
		name,
	};
}

type FieldPositionInfo = {
	name: string;
	value: PositionTime;
};

function setPositionInfo(
	value: PositionTime,
	name: string
): FieldPositionInfo {
	return {
		value,
		name,
	};
}

type FieldFrequencyInfo = {
	name: string;
	value: FrequencyTime;
};

function setFrequencyInfo(
	value: FrequencyTime,
	name: string
): FieldFrequencyInfo {
	return {
		value,
		name,
	};
}

@Unsubscriber()
@Component({
	selector: 'date-arrives',
	templateUrl: '../templates/date-arrives.pug',
	styleUrls: [ '../styles/date-arrives.scss' ],
	host: { class: 'date-arrives' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateArrivesComponent
	extends TriggerBase
	implements OnInit {

	@ViewChild( 'dateDrop' )
	protected dateDrop: CUBDropdownComponent;
	@ViewChild( 'scheduleDrop' )
	protected scheduleDrop: CUBDropdownComponent;

	@ViewChild('inputTime')
	protected inputTime: CUBFormFieldInputDirective;
	@ViewChild('inputNumDay')
	protected inputNumDay: CUBFormFieldInputDirective;
	@ViewChild( 'inputSchedule' )
	protected inputSchedule: CUBFormFieldComponent;
	@ViewChild( 'inputDate' )
	protected inputDate: CUBFormFieldComponent;
	@ViewChild( 'inputPickTime' )
	protected inputPickTime: CUBTimePickerDirective;

	@Input() public settings: DateArrivesSetting;

	@Output() public settingsChange: EventEmitter<DateArrivesSetting>
		= new EventEmitter<DateArrivesSetting>();

	public readonly OPTION_DATE: typeof TypeTimeOption = TypeTimeOption;
	public readonly typeControl: FormControl
		= new FormControl( undefined );
	public readonly timeEventControl: FormControl
		= new FormControl( undefined );

	public currentRadio: number;
	public dateForm: FormGroup;
	public scheduleForm: FormGroup;

	protected readonly FIELD_EVENTS_TYPE: ReadonlySet<FieldEventInfo>
		= new Set([
			setFieldEventInfo(
				EventDay.DAY,
				'DAY'
			),
			setFieldEventInfo(
				EventDay.WEEK,
				'WEEK'
			),
			setFieldEventInfo(
				EventDay.MONTH,
				'MONTH'
			),
		]);
	protected readonly FIELD_POSITION_TYPE: ReadonlySet<FieldPositionInfo>
		= new Set([
			setPositionInfo(
				PositionTime.BEFORE,
				'BEFORE'
			),
			setPositionInfo(
				PositionTime.AFTER,
				'AFTER'
			),
		]);
	protected readonly FIELD_FREQUENCY_TYPE: ReadonlySet<FieldFrequencyInfo>
		= new Set([
			setFrequencyInfo(
				FrequencyTime.MONTHLY,
				'MONTHLY'
			),
			setFrequencyInfo(
				FrequencyTime.YEARLY,
				'YEARLY'
			),
		]);

	protected fields: BoardField[];
	protected dateSelectionTime: any;

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );

	/**
	 * @constructor
	 */
	ngOnInit() {
		this.dateForm = this._fb.group({
			quantity: [
				undefined,
				[
					Validators.pattern(/^[1-9]\d*$/),
				],
			],
			period: undefined,
			positionTime: undefined,
			timeDay: undefined,
		});

		this.scheduleForm = this._fb.group({
			frequency: undefined,
			timeRepeat: undefined,
		});

		if( this.settings.boardID ) {
			this._getField( this.settings.boardID );

			if (
				!this.isEntry
				&& !this.settings.dateSelection
			) {
				this.settings.dateSelection = {
					fieldID: undefined,
					time: null,
					date: {} as DateEvent,
					schedule: {} as ScheduleEvent,
				};

				setTimeout(
					() => this.dateDrop?.open()
				);

				this.settingsChange.emit( this.settings );
			}
		}

		if( this.settings.dateSelection?.time ) {
			this.currentRadio = this.OPTION_DATE.TIME;
			return;
		}

		if( !_.isStrictEmpty( this.settings.dateSelection?.date )) {
			this.currentRadio = this.OPTION_DATE.DATE;

			setTimeout(
				() => {
					this.inputNumDay?.focus();
				},
				100
			);
			return;
		}

		if( !_.isStrictEmpty( this.settings.dateSelection?.schedule )) {
			this.currentRadio = this.OPTION_DATE.SCHEDULE;
		}
	}

	/**
	 * @return {void}
	 */
	protected changedTime(time: TimeGap) {
		switch (this.currentRadio) {
			case this.OPTION_DATE.TIME:
				this.settings.dateSelection.time = time;
				break;
			case this.OPTION_DATE.DATE:
				this.settings.dateSelection.date.time = time;
				break;
			case this.OPTION_DATE.SCHEDULE:
				this.settings.dateSelection.schedule.time = time;
				break;
		}
		this.settingsChange.emit(this.settings);
	}

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings?.boardID ) return;

		this.settings = {
			boardID,
			row: {
				type: RowTriggerType.ANY,
			},
			dateSelection: {
				fieldID: undefined,
				time: null,
				date: {} as DateEvent,
				schedule: {} as ScheduleEvent,
			},
		};

		this._getField( boardID );
		this._cdRef.markForCheck();
		this.settingsChange.emit( this.settings );
		this._workflowService.boardIDChanged$.next();

		setTimeout(
			() => this.dateDrop?.open()
		);

		this.typeControl.reset();
	}

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this.typeControl.reset();
		if(
			this.settings.row.type === RowTriggerType.ANY
		) {
			setTimeout(
				() => this.dateDrop?.open()
			);
		}
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onDateTypeChange(
		fieldID: string
	) {
		this.settings.dateSelection.fieldID = fieldID;

		switch ( this.currentRadio ) {
			case this.OPTION_DATE.TIME:
				setTimeout( () => {
					this.inputTime?.focus();
					this.inputPickTime?.open();
				});
				break;
			case this.OPTION_DATE.DATE:
				setTimeout( () => this.inputNumDay?.focus() );
				break;
			case this.OPTION_DATE.SCHEDULE:
				setTimeout( () => this.scheduleDrop?.open() );
				break;
		}
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {number} e
	 * @return {void}
	 */
	protected onTargetFieldChanged(
		e: number
	){
		if( e === this.currentRadio ) return;
		this.currentRadio = e;

		switch (e) {
			case this.OPTION_DATE.TIME:
				setTimeout( () => {
					this.inputTime?.focus();
					this.inputPickTime?.open();
					this.timeEventControl.reset();
				}, 100 );

				this.settings.dateSelection.time =
					this.settings.dateSelection.time;
				this.settings.dateSelection.date = {} as DateEvent;
				this.settings.dateSelection.schedule = {} as ScheduleEvent;

				break;
			case this.OPTION_DATE.DATE:
				setTimeout( () => {
					this.inputNumDay.focus();
					this.dateForm.reset();
				}, 100 );

				this.settings.dateSelection.time = null;
				this.settings.dateSelection.date = {
					quantity: this.settings.dateSelection?.date?.quantity,
					time: this.settings.dateSelection?.date?.time,
					period: this.settings.dateSelection?.date?.period,
					positionTime:
					this.settings.dateSelection?.date?.positionTime,
				};
				this.settings.dateSelection.schedule = {} as ScheduleEvent;

				break;
			case this.OPTION_DATE.SCHEDULE:
				setTimeout( () => {
					this.scheduleDrop.open();
					this.scheduleForm.reset();
				}, 100 );

				this.settings.dateSelection.time = null;
				this.settings.dateSelection.date = {} as DateEvent;
				this.settings.dateSelection.schedule = {
					frequency:
						this.settings.
						dateSelection?.
						schedule?.
						frequency,
					time: this.settings.dateSelection?.schedule?.time,
				};

				break;
			default:
				break;
		}

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onQuantityChange(
		quantity: number
	) {
		this.settings.dateSelection.date.quantity = quantity;
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onPeriodChange(
		period: number
	) {
		this.settings.dateSelection.date.period = period;
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onPositionTimeChange(
		positionTime: number
	) {
		this.settings.dateSelection.date.positionTime = positionTime;
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onFrequencyChange(
		frequency: number
	) {
		this.settings.dateSelection.schedule.frequency = frequency;
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	private _getField(
		boardID: ULID
	) {
		this._boardFieldService
		.get( boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this.fields = _.filter( fields, ( f: BoardField ) =>
					[
						DataType.Date,
						DataType.LastModifiedTime,
						DataType.CreatedTime,
					].includes(f.dataType)
				);
				this._cdRef.detectChanges();
			},
		});
		this.currentRadio = this.OPTION_DATE.TIME;
	}
}
