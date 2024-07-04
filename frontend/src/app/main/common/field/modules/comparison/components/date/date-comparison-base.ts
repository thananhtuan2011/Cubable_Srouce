/* eslint-disable @typescript-eslint/naming-convention */
import {
	OnChanges,
	ViewChild,
	Directive,
	Input,
	inject,
	SimpleChanges
} from '@angular/core';
import {
	FormControl,
	FormGroup,
	FormBuilder
} from '@angular/forms';
import moment, {
	Moment
} from 'moment-timezone';
import _ from 'lodash';

import {
	CUBMenuTriggerForDirective
} from '@cub/material/menu';
import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';
import {
	CUBDatePickerDirective
} from '@cub/material/date-picker';

import {
	ComparisonOperator,
	ComparisonType,
	TimePeriodPrefixType,
	TimePeriodType
} from '@main/common/field/modules/comparison/resources/comparison';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

export enum DateSpecific {
	Today = 1,
	Yesterday,
	Tomorrow,

	ThisWeek,
	ThisMonth,
	ThisYear,

	LastWeek,
	LastMonth,
	LastYear,

	NextWeek,
	NextMonth,
	NextYear,
}

export type TimeData = AdvanceData & {
	// specific
	specific?: DateSpecific;

	// static
	prefix?: TimePeriodPrefixType;
	quantity?: number;
	type?: TimePeriodType;
	date?: Moment;

	// range
	start?: Moment;
	end?: Moment;
};

type DateSpecificInfo = {
	value: DateSpecific;
	label: string;
	icon: string;
};

type RangeErrorType = {
	required: boolean;
	value: boolean;
};

const operatorHasComparisonType: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.IS_BEFORE,
	ComparisonOperator.IS_AFTER,
]);

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
]);

function setDateDataType(
	value: number,
	label: string
): DateSpecificInfo {
	return {
		value,
		label: `FIELD.COMPARISON.DATE_SPECIFIC.${label}`,
		icon: 'calendar-clock-fill',
	};
}

@Directive()
export abstract class DateComparisonBase<T>
	extends ComparisonBase<TimeData, DateSpecific>
	implements OnChanges {

	@ViewChild( 'compareTodayMenuTrigger' )
	private _compareTodayMenuTrigger: CUBMenuTriggerForDirective;
	@ViewChild( 'rangeTrigger' )
	private _rangeTrigger: CUBDatePickerDirective;
	@ViewChild( 'dateInput' )
	private _dateInput: CUBFormFieldInputDirective;

	@Input() public field: T;

	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;
	protected readonly comparisonOperator: typeof ComparisonOperator
		= ComparisonOperator;
	protected readonly timePeriodPrefixType: typeof TimePeriodPrefixType
		= TimePeriodPrefixType;
	protected readonly prefixes: TimePeriodPrefixType[]
		= [
			TimePeriodPrefixType.THIS,
			TimePeriodPrefixType.LAST,
			TimePeriodPrefixType.NEXT,
		];
	protected readonly types: TimePeriodType[]
		= [
			TimePeriodType.DAY,
			TimePeriodType.WEEK,
			TimePeriodType.MONTH,
			TimePeriodType.YEAR,
		];
	protected readonly comparisonOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EMPTY,
				'IS_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EMPTY,
				'IS_NOT_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_BETWEEN,
				'IS_BETWEEN_DATE'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_BETWEEN,
				'IS_NOT_BETWEEN_DATE'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EXACTLY,
				'IS_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EXACTLY,
				'IS_NOT_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_BEFORE,
				'IS_BEFORE'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_AFTER,
				'IS_AFTER'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.COMPARE_TODAY,
				'COMPARE_TODAY'
			),
		];
	protected readonly exactlyControl: FormControl
		= new FormControl( undefined );
	protected readonly generalComparisonControl: FormControl
		= new FormControl( undefined );

	protected showRequireError: RangeErrorType;
	protected compareTodayForm: FormGroup;
	protected dateRangeValue: Moment[];

	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if ( changes.field ) {
			this.compareTodayForm = this._fb.group({
				prefixControl	: undefined,
				quantityControl	: undefined,
				typeControl		: undefined,
			});

			if ( this.data
				&& this.operator === ComparisonOperator.COMPARE_TODAY
			) {
				this.handleDateRange();
			}

			if (
				this.data
				&& ( this.operator
						=== ComparisonOperator.IS_BETWEEN
					|| this.operator
						=== ComparisonOperator.IS_NOT_BETWEEN
				)
			) {
				this._handleDateRangeInput();
			}
		}

		if (
			changes.operator?.currentValue === ComparisonOperator.IS_EXACTLY
		) {
			this._setDateSpecific();
		}
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.comparisonTypeSpecific = [];
		this.dateRangeValue = null;

		this.data = operatorHasComparisonType.has( this.operator )
			? {
				compareType: DateComparisonBase.default.compareType,
			}
			: comparisonNotCustomValue.has( this.operator )
				? undefined
				: {};

		switch( this.operator ) {
			case ComparisonOperator.COMPARE_TODAY:
				this.data.prefix = this.prefixes[ 0 ];
				this.data.type = this.types[ 0 ];

				this.handleDateRange();

				setTimeout(
					() => this._compareTodayMenuTrigger
						&& this._compareTodayMenuTrigger.open()
				);
				break;
			case ComparisonOperator.IS_BETWEEN:
			case ComparisonOperator.IS_NOT_BETWEEN:
				if ( this.dateRangeValue ) {
					this.data.start = this.dateRangeValue[ 0 ];
					this.data.end = this.dateRangeValue[ 1 ];
				}

				setTimeout(
					() => this._rangeTrigger
						&& this._rangeTrigger.open()
				);
				break;
			case ComparisonOperator.IS_EXACTLY:
				this._setDateSpecific();
				break;
		}

		if (
			operatorHasComparisonType.has( this.operator )
		) {
			setTimeout(
				() => this._dateInput.focus()
			);
		}

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @return {void}
	 */
	protected dateRangeValueChange() {
		this.showRequireError = {
			required: false,
			value: false,
		};

		if (
			!this.dateRangeValue?.[ 0 ]
			|| !this.dateRangeValue?.[ 1 ]
		) {
			this.showRequireError.required
				= true;
			this.data = null;
		} else if (
			this.dateRangeValue[ 0 ]
			>= this.dateRangeValue[ 1 ]
		) {
			this.showRequireError.value
				= true;
			this.data = null;
		} else {
			this.data = {
				start: this.dateRangeValue[ 0 ],
				end: this.dateRangeValue[ 1 ],
			};
		}

		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	protected override onDataChange() {
		super.onDataChange();
	}

	// /**
	//  * @param {DateDataType} type
	//  * @return {void}
	//  */
	// protected onCompareTypeChange( type: DateDataType ) {
	// 	this.data.compareType = type;

	// 	if(
	// 		this.data.compareType === this.dateDataType.CUSTOM_DATE
	// 	) {
	// 		setTimeout(
	// 			() => this._dateInput.focus()
	// 		);
	// 	} else {
	// 		// TODO
	// 		// this.openComparisonSpecificField();
	// 	}

	// 	super.onDataChange();
	// 	this.resetDataControl();
	// }

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		type: ComparisonType
	) {
		super.onTypeChange(
			type
		);

		this.data = {
			...this.data,
			prefix: undefined,
			quantity: undefined,
			type: undefined,
			date: undefined,
			start: undefined,
			end: undefined,
		};

		// switch ( this.data.compareType ) {
		// 	case ComparisonPeopleType.SPECIFIC_FIELD:
		// 		// TODO
		// 		// this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonPeopleType.CUSTOM:
		// 		setTimeout(
		// 			() => this._cubMemberList.pickerMenuTrigger.open()
		// 		);
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @param {Moment} date
	 * @return {void}
	 */
	protected pickSpecificDate( date: Moment ) {
		this.data.date = date;

		super.onDataChange();
	}

	/**
	 * @param {number=} quantity
	 * @return {void}
	 */
	protected handleDateRange( quantity?: number ) {
		if ( quantity ) {
			this.data.quantity
				= +quantity;
		}

		switch( this.data.prefix ) {
			case TimePeriodPrefixType.THIS:
				switch( this.data.type ) {
					case TimePeriodType.DAY:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ),
							];
						break;
					case TimePeriodType.MONTH:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( 1, 'month' ),
							];
						break;
					case TimePeriodType.WEEK:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( 1, 'week' ),
							];
						break;
					case TimePeriodType.YEAR:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( 1, 'year' ),
							];
						break;
				}
				break;
			case TimePeriodPrefixType.LAST:
				switch( this.data.type ) {
					case TimePeriodType.DAY:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ).subtract( this.data.quantity, 'day' ),
								moment().startOf( 'd' ),
							];
						break;
					case TimePeriodType.MONTH:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ).subtract( this.data.quantity, 'month' ),
								moment().startOf( 'd' ),
							];
						break;
					case TimePeriodType.WEEK:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ).subtract( this.data.quantity, 'week' ),
								moment().startOf( 'd' ),
							];
						break;
					case TimePeriodType.YEAR:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ).subtract( this.data.quantity, 'year' ),
								moment().startOf( 'd' ),
							];
						break;
				}
				break;
			case TimePeriodPrefixType.NEXT:
				switch( this.data.type ) {
					case TimePeriodType.DAY:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( this.data.quantity, 'day' ),
							];
						break;
					case TimePeriodType.MONTH:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( this.data.quantity, 'month' ),
							];
						break;
					case TimePeriodType.WEEK:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( this.data.quantity, 'week' ),
							];
						break;
					case TimePeriodType.YEAR:
						this.dateRangeValue
							= [
								moment().startOf( 'd' ),
								moment().startOf( 'd' ).add( this.data.quantity, 'year' ),
							];
						break;
				}
				break;
		}
	}

	/**
	 * @return {void}
	 */
	private _handleDateRangeInput() {
		this.dateRangeValue = [ this.data.start, this.data.end ];
	}

	/**
	 * @return {void}
	 */
	private _setDateSpecific() {
		if ( this.comparisonTypeSpecific?.length ) return;

		this.comparisonTypeSpecific
			= [
				setDateDataType(
					DateSpecific.Today,
					'TODAY'
				),
				setDateDataType(
					DateSpecific.Yesterday,
					'YESTERDAY'
				),
				setDateDataType(
					DateSpecific.Tomorrow,
					'TOMORROW'
				),
				setDateDataType(
					DateSpecific.ThisWeek,
					'THIS_WEEK'
				),
				setDateDataType(
					DateSpecific.LastWeek,
					'LAST_WEEK'
				),
				setDateDataType(
					DateSpecific.NextWeek,
					'NEXT_WEEK'
				),
				setDateDataType(
					DateSpecific.ThisMonth,
					'THIS_MONTH'
				),
				setDateDataType(
					DateSpecific.LastMonth,
					'LAST_MONTH'
				),
				setDateDataType(
					DateSpecific.NextMonth,
					'NEXT_MONTH'
				),
				setDateDataType(
					DateSpecific.ThisYear,
					'THIS_YEAR'
				),
				setDateDataType(
					DateSpecific.LastYear,
					'LAST_YEAR'
				),
				setDateDataType(
					DateSpecific.NextYear,
					'NEXT_YEAR'
				),
			];
	}

}
