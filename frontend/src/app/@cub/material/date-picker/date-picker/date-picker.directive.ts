import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';
import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuConfig,
	CUBMenuRef,
	CUBMenuService
} from '../../menu';

import {
	CUBDate,
	CUBDatePickerComponent
} from './date-picker.component';

@Unsubscriber()
@Directive({
	selector: '[cubDatePicker]',
	exportAs: 'cubDatePicker',
})
export class CUBDatePickerDirective {

	@Input( 'cubDatePickerCurrentDate' )
	public currentDate: string | CUBDate;
	@Input( 'cubDatePickerMinDate' )
	public minDate: string | CUBDate;
	@Input( 'cubDatePickerMaxDate' )
	public maxDate: string | CUBDate;
	@Input( 'cubDatePickerDateOnly' ) @CoerceBoolean()
	public dateOnly: boolean;
	@Input( 'cubDatePickerDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubDatePickerCloseAfterPicked' ) @DefaultValue() @CoerceBoolean()
	public closeAfterPicked: boolean = true;
	@Input( 'cubDatePickerDateRange' ) @CoerceBoolean()
	public dateRange: boolean;
	@Input( 'cubDatePickerDateRangeInput' ) @CoerceBoolean()
	public dateRangeInput: boolean;
	@Input() @CoerceBoolean()
	public isShowInvalidState: boolean;
	@Input() public dateRangeValue: CUBDate[];

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public yearSelected: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public monthSelected: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public calendarChanged:
		EventEmitter<{ year: number; month: number }>
		= new EventEmitter<{ year: number; month: number }>();
	@Output() public picked: EventEmitter<CUBDate>
		= new EventEmitter<CUBDate>();
	@Output( 'cubDatePickerChange' )
	public pickedDateChange: EventEmitter<CUBDate>
			= new EventEmitter<CUBDate>();
	@Output() public dateRangeValueChange: EventEmitter<CUBDate[]>
		= new EventEmitter<CUBDate[]>();

	public origin: ElementRef;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _menuRef: CUBMenuRef<CUBDatePickerComponent>;
	private _pickedDate: string | CUBDate;

	get isOpened(): boolean {
		return !!this
		._menuRef
		?.isOpened;
	}

	@Input( 'cubDatePicker' )
	get pickedDate(): string | CUBDate {
		return this._pickedDate;
	}
	set pickedDate(
		date: string | CUBDate
	) {
		this._pickedDate = date;

		if ( !this._menuRef ) {
			return;
		}

		this
		._menuRef
		.instance
		.picked = date;
	}

	@HostListener( 'click' )
	protected onClick() {
		if ( this.disableOpen ) {
			return;
		}

		this.open();
	}

	/**
	 * @param {CUBMenuConfig=} config
	 * @return {void}
	 */
	public open(
		config?: CUBMenuConfig
	) {
		if (
			this.isOpened
			|| this.disableOpen
		) {
			return;
		}

		this._menuRef
			= this._menuService.open(
				this.origin
					|| this._elementRef,
				CUBDatePickerComponent,
				undefined,
				config
			);

		this
		._menuRef
		.afterOpened()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.opened.emit();

			const {
				instance,
			}: CUBMenuRef<CUBDatePickerComponent>
				= this._menuRef;

			instance.current
				= this.currentDate;
			instance.min
				= this.minDate;
			instance.max
				= this.maxDate;
			instance.dateOnly
				= this.dateOnly;
			instance.yearSelected
				= this.yearSelected;
			instance.monthSelected
				= this.monthSelected;
			instance.calendarChanged
				= this.calendarChanged;
			instance.dateRange
				= this.dateRange;
			instance.dateRangeInput
				= this.dateRangeInput;
			instance.isShowInvalidState
				= this.isShowInvalidState;

			if ( this.dateRangeValue ) {
				instance.dateRangeValue
					= this.dateRangeValue;
				instance.picked
					= this.dateRangeValue;
			} else if ( !this.dateRange ) {
				instance.picked
					= this.pickedDate;
			}

			instance
			.pickedChange
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(
				( date: CUBDate ) => {
					this
					.pickedDateChange
					.emit(
						this.pickedDate = date
					);

					if ( !this.closeAfterPicked
						|| !this.dateOnly
						|| this.dateRange ) {
						return;
					}

					this.close();
				}
			);

			instance
			.dateRangeValueChange
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(
				( date: CUBDate[] ) => {
					this.dateRangeValue
						= date;
				}
			);
		});

		this
		._menuRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.closed.emit();

			this.picked.emit(
				this.pickedDate as CUBDate
			);

			if ( !this.dateRange ) {
				return;
			}

			this
			.dateRangeValueChange
			.emit( this.dateRangeValue );
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) {
			return;
		}

		this._menuRef.close();
	}

}
