import {
	AfterViewChecked,
	AfterViewInit,
	Directive,
	EventEmitter,
	Host,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {
	Subject
} from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	startWith,
	tap
} from 'rxjs/operators';

import {
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBFormFieldInputDirective
} from '../../form-field/form-field-input.directive';

import {
	createCUBDate,
	CUBDate,
	isCUBDate
} from '../date-picker/date-picker.component';
import {
	CUBDatePickerDirective
} from '../date-picker/date-picker.directive';

export const DATE_FORMAT_REGEXP: RegExp
	= /^([0-9\/\-]+)\s?([0-9\:]*)$/;

type ChangeState = [ CUBDate, boolean? ];

@Unsubscriber()
@Directive({
	selector: 'input[cubDatePicker]',
})
export class CUBDatePickerInputDirective
implements AfterViewChecked, AfterViewInit, OnChanges, OnInit {

	@Input( 'cubDatePickerDateFormat' ) @DefaultValue()
	public dateFormat: string = 'DD/MM/YYYY';

	@Output() public dateChanges: EventEmitter<CUBDate>
		= new EventEmitter<CUBDate>();
	@Output() public dateChanged: EventEmitter<CUBDate>
		= new EventEmitter<CUBDate>();

	private readonly _changeState$: Subject<ChangeState>
		= new Subject();

	private _date: CUBDate;

	@Input( 'cubDatePicker' )
	get date(): CUBDate {
		return this._date;
	}
	set date( d: string | CUBDate ) {
		if ( d && !isCUBDate( d ) ) {
			d = createCUBDate( this.date );
		}

		this._date = d as CUBDate;
	}

	/**
	 * @constructor
	 * @param {CUBFormFieldInputDirective} input
	 * @param {CUBDatePickerDirective} datePicker
	 */
	constructor(
		@Host() protected input:
			CUBFormFieldInputDirective,
		@Host() protected datePicker:
			CUBDatePickerDirective
	) {
		this.datePicker.open
			= this.datePicker.open.bind(
				this.datePicker,
				{
					autoFocus: false,
					position: 'start-below',
				}
			);
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.date ) {
			this._setDateToInput();

			this._changeState$.next([
				this.date,
				true,
			]);
		}
	}

	ngOnInit() {
		this
		._changeState$
		.pipe(
			startWith([
				this.date,
				true,
			]),
			distinctUntilChanged(
				(
					[ prev ]: ChangeState,
					[ curr ]: ChangeState
				): boolean => {
					return prev === curr
						|| !!prev?.isSame( curr );
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe((
			[
				value,
				isInitialValue,
			]: ChangeState
		) => {
			if ( isInitialValue ) {
				return;
			}

			this.dateChanged.emit( value );
		});
	}

	ngAfterViewInit() {
		this.datePicker.origin
			= this
			.input
			.formField
			?.container;

		if ( !this.input.placeholder ) {
			this
			.input
			.element
			.setAttribute(
				'placeholder',
				this.dateFormat
			);
		}

		this
		.input
		.valueWritten$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( value: string ) => {
			this._setDate(
				this._convertTextToDate( value )
			);
		});

		this
		.input
		.input$
		.pipe(
			tap( () => this._openPicker() ),
			debounceTime( 400 ),
			distinctUntilChanged(),
			untilCmpDestroyed( this )
		)
		.subscribe(( e: InputEvent ) => {
			const date: CUBDate
				= this._convertTextToDate(
					( e.target as any ).value
				);

			if ( !date ) {
				return;
			}

			this._setDate( date );

			this.dateChanges.emit( date );
		});

		this
		.input
		.focus$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe((
			{
				type,
				sourceCapabilities,
			}: FocusEvent | any
		) => {
			switch ( type ) {
				case 'focus':
					if ( sourceCapabilities ) {
						this._openPicker();
					}
					break;
				case 'blur':
					this._setDateToInput();

					if (
						!this
						.input
						.formField
						.focusing
					) {
						this
						._changeState$
						.next([ this.date ]);
					}
					break;
			}
		});

		this
		.datePicker
		.pickedDateChange
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( date: CUBDate ) => {
			this.dateChanges.emit(
				this.date = date
			);

			this._setDateToInput();
		});

		this
		.datePicker
		.opened
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this
			.input
			.formField
			.focusing = true;
		});

		this
		.datePicker
		.closed
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this
			.input
			.formField
			.focusing = false;
		});
	}

	ngAfterViewChecked() {
		this.datePicker.disableOpen
			||= this.input.disabled;
	}

	/**
	 * @param {CUBDate} date
	 * @return {void}
	 */
	private _setDate( date: CUBDate ) {
		this.datePicker.pickedDate
			= this.date
			= date;
	}

	/**
	 * @param {CUBDate=} date
	 * @return {void}
	 */
	private _setDateToInput(
		date: CUBDate = this.date as CUBDate
	) {
		this._updateInputValue(
			date
				? date.format( this.dateFormat )
				: ''
		);
	}

	/**
	 * @param {string} value
	 * @return {void}
	 */
	private _updateInputValue(
		value: string
	) {
		if ( value === this.input.value ) {
			return;
		}

		this
		.input
		.writeValue( value, false );
		this
		.input
		.control
		?.setValue( value );
	}

	/**
	 * @param {string} text
	 * @return {CUBDate}
	 */
	private _convertTextToDate(
		text: string
	): CUBDate {
		let date: CUBDate = null;

		if ( text ) {
			const d: CUBDate
				= createCUBDate(
					text,
					this.dateFormat
				);

			if ( d.isValid() ) {
				date = d;
			}
		}

		return date;
	}

	/**
	 * @return {void}
	 */
	private _openPicker() {
		if (
			this
			.datePicker
			.disableOpen
		) {
			return;
		}

		this.datePicker.open();
	}

}
