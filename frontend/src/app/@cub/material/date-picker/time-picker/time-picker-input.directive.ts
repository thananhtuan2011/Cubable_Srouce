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
import moment, { Moment }
	from 'moment-timezone';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBFormFieldInputDirective
} from '../../form-field/form-field-input.directive';

import {
	createTimeString,
	CUBTime
} from './time-menu.component';
import {
	CUBTimePickerDirective
} from './time-picker.directive';

type ChangeState = [ CUBTime, boolean? ];

const TIME_FORMAT: string = 'HH:mm';

@Unsubscriber()
@Directive({
	selector: 'input[cubTimePicker]',
})
export class CUBTimePickerInputDirective
implements AfterViewChecked, AfterViewInit, OnChanges, OnInit {

	@Input( 'cubTimePicker' )
	public time: CUBTime;

	@Output() public timeChanges: EventEmitter<CUBTime>
		= new EventEmitter<CUBTime>();
	@Output() public timeChanged: EventEmitter<CUBTime>
		= new EventEmitter<CUBTime>();

	private readonly _changeState$: Subject<ChangeState>
		= new Subject();

	/**
	 * @constructor
	 * @param {CUBFormFieldInputDirective} input
	 * @param {CUBTimePickerDirective} timePicker
	 */
	constructor(
		@Host() protected readonly input:
			CUBFormFieldInputDirective,
		@Host() protected readonly timePicker:
			CUBTimePickerDirective
	) {
		this.timePicker.open
			= this.timePicker.open.bind(
				this.timePicker,
				{
					autoFocus: false,
					position: 'start-below',
				}
			);
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.time ) {
			this._setTimeToInput();

			this._changeState$.next([
				this.time,
				true,
			]);
		}
	}

	ngOnInit() {
		this
		._changeState$
		.pipe(
			startWith([
				this.time,
				true,
			]),
			distinctUntilChanged(
				(
					[ prev ]: ChangeState,
					[ curr ]: ChangeState
				): boolean => {
					return _.isEqual( prev, curr );
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

			this.timeChanged.emit( value );
		});
	}

	ngAfterViewInit() {
		this.timePicker.origin
			= this
			.input
			.formField
			.container;

		if ( !this.input.placeholder ) {
			this
			.input
			.element
			.setAttribute(
				'placeholder',
				TIME_FORMAT
			);
		}

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
			const time: CUBTime
				= this._convertTextToTime(
					( e.target as any ).value
				);

			if ( !time ) {
				return;
			}

			this.timeChanges.emit(
				this.time = time
			);
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
					this._setTimeToInput();

					if (
						!this
						.input
						.formField
						.focusing
					) {
						this
						._changeState$
						.next([ this.time ]);
					}
					break;
			}
		});

		this
		.timePicker
		.picked
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( time: CUBTime ) => {
			this.timeChanges.emit(
				this.time = time
			);

			this._setTimeToInput();
		});

		this
		.timePicker
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
		.timePicker
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
		this.timePicker.disableOpen
			||= this.input.disabled;
	}

	/**
	 * @param {CUBTime=} time
	 * @return {void}
	 */
	private _setTimeToInput(
		time: CUBTime = this.time
	) {
		this._updateInputValue(
			time
				? createTimeString(
					time.hour,
					time.minute
				)
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
	 * @return {CUBTime}
	 */
	private _convertTextToTime(
		text: string
	): CUBTime {
		let time: CUBTime = null;

		if ( text ) {
			const m: Moment
				= moment( text, TIME_FORMAT );

			if ( m.isValid() ) {
				time = {
					hour: m.hour(),
					minute: m.minute(),
				};
			}
		}

		return time;
	}

	/**
	 * @return {void}
	 */
	private _openPicker() {
		if (
			this
			.timePicker
			.disableOpen
		) {
			return;
		}

		this.timePicker.open();
	}

}
