import {
	Directive, ElementRef, Input,
	HostListener, EventEmitter, Output,
	OnChanges, SimpleChanges, forwardRef,
	Renderer2, Optional, Inject,
	AfterViewInit, HostBinding
} from '@angular/core';
import { FormControl, DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import {
	DATE_TIME_CONFIG, DateTimeConfig, TimeFormat,
	DefaultValue, CoerceBoolean, CoerceCssPixel,
	CoerceNumber, Memoize
} from '@core';
import { CONSTANT as APP_CONSTANT } from '@resources';

const yearsRegex: RegExp = /([0-9]+)[ ]?(y(ears?)?)/gi;
const monthsRegex: RegExp = /([0-9]+)[ ]?(mon(ths?)?)/gi;
const weeksRegex: RegExp = /([0-9]+)[ ]?(w(eeks?)?)/gi;
const daysRegex: RegExp = /([0-9]+)[ ]?(d(ays?)?)/gi;
const hoursRegex: RegExp = /([0-9]+)[ ]?(h(ours?)?)/gi;
const minsRegex: RegExp = /([0-9]+)[ ]?(m(in(ute)?s?)?)/gi;
const secondsRegex: RegExp = /([0-9]+)[ ]?(s(ec(ond)?s?)?)/gi;

const TRIM_VALUE_ACCESSOR: any = {
	provide		: NG_VALUE_ACCESSOR,
	useExisting	: forwardRef( () => WGCFormFieldInputDirective ),
	multi		: true,
};

export type WGCIFormFieldAlignment = 'left' | 'right' | 'center';
export type WGCIFormFieldConvertType = 'time-string' | 'hour-string';
export interface WGCIFormFieldConvertedEvent {
	hour?: number;
	min?: number;
	sec?: number;
	totalMins: number;
	totalSeconds: number;
	totalMiliseconds: number;
	type: WGCIFormFieldConvertType;
}

@Directive({
	selector	: '[wgcFormFieldInput]',
	exportAs	: 'wgcFormFieldInput',
	providers	: [ TRIM_VALUE_ACCESSOR ],
})
export class WGCFormFieldInputDirective extends DefaultValueAccessor implements OnChanges, AfterViewInit {

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean { return this.disabled || this.isDisabledFromFormField || undefined; }

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean { return this.readonly || undefined; }

	@HostBinding( 'attr.required' )
	get attrRequired(): boolean { return this.required || undefined; }

	@HostBinding( 'attr.type' )
	get attr(): string { return this.type; }

	@Input() public ngModel: any;
	@Input() public name: string;
	@Input() @DefaultValue() public type: string = 'text';
	@Input() @CoerceCssPixel() public textSize: string;
	@Input() @CoerceNumber() public min: number;
	@Input() @CoerceNumber() public max: number;
	@Input() @DefaultValue() @CoerceBoolean() public trim: boolean = true;
	@Input() public disableControl: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public focusing: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public clearable: boolean;
	@Input() @CoerceBoolean() public saveable: boolean;
	@Input() @CoerceBoolean() public cancelable: boolean;
	@Input() public formControl: FormControl;
	@Input() @DefaultValue() public alignment: WGCIFormFieldAlignment = 'left';
	@Input() public convertType: WGCIFormFieldConvertType;

	@Output() public ngModelChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() public changed: EventEmitter<any> = new EventEmitter<any>();
	@Output() public saved: EventEmitter<any> = new EventEmitter<any>();
	@Output() public cancelled: EventEmitter<any> = new EventEmitter<any>();
	@Output() public cleared: EventEmitter<any> = new EventEmitter<any>();
	@Output() public pasted: EventEmitter<ClipboardEvent> = new EventEmitter<ClipboardEvent>();
	@Output() public converted: EventEmitter<WGCIFormFieldConvertedEvent> = new EventEmitter<WGCIFormFieldConvertedEvent>();

	public isDisabledFromFormField: boolean;
	public stateChanges$: Subject<void> = new Subject<void>();
	public changes$: Subject<any> = new Subject<any>();

	private _bkValue: any;
	private _timeFormat: TimeFormat;

	@Input()
	get timeFormat(): TimeFormat {
		return this._timeFormat || this._dateTimeConfig.timeFormat || APP_CONSTANT.TIME_FORMAT;
	}
	set timeFormat( value: TimeFormat ) {
		this._timeFormat = value;
	}

	get value(): any {
		return this.elementRef.nativeElement.value;
	}
	set value( value: any ) {
		if ( this._compareValue( value, this.elementRef.nativeElement.value ) ) return;

		this.elementRef.nativeElement.value = value;
	}

	get isTextarea(): boolean { return this.elementRef.nativeElement instanceof HTMLTextAreaElement; }

	get isNumberInput(): boolean { return this.type === 'number' || this.type === 'range'; }

	get hasValue(): boolean { return this._checkValidValue( this.value ); }

	/**
	 * @constructor
	 * @param {Renderer2} renderer
	 * @param {ElementRef} elementRef
	 * @param {DateTimeConfig} _dateTimeConfig
	 */
	constructor(
		protected renderer: Renderer2,
		protected elementRef: ElementRef,
		@Optional() @Inject( DATE_TIME_CONFIG ) private _dateTimeConfig: DateTimeConfig
	) {
		super( renderer, elementRef, undefined );
	}

	@HostListener( 'focus', [ '$event' ] )
	public triggerFocus( event: Event ) {
		if ( this.disabled || this.disableControl ) {
			event.preventDefault();
			this.blur( event );
			return;
		}

		this.focusing = true;
		this._bkValue = this._checkValidValue( this._bkValue ) ? this._bkValue : this.value;

		this.hasValue ? this.formControl?.markAsTouched() : this.formControl?.markAsUntouched();
		this.stateChanges$.next();
	}

	@HostListener( 'blur', [ '$event.target.value' ] )
	public triggerBlur( value: string ) {
		this.focusing = false;

		this.onTouched();
		this.stateChanges$.next();
		this._convertValue( value );
	}

	@HostListener( 'input' )
	public triggerInput() {
		if ( this.formControl?.updateOn === 'blur' ) return;

		this.formControl?.markAsTouched();
		this.onTouched();
		this.onChange( this.value );
		this.changes$.next( this.value );
	}

	@HostListener( 'keypress', [ '$event' ] )
	public triggerKeyPress( event: KeyboardEvent ) {
		if ( !this.isNumberInput ) return;

		const charCode: number = event.key.charCodeAt( 0 );

		if ( charCode === 45 // minus
			|| charCode === 46 // dot
			|| ( charCode >= 48 && charCode <= 57 ) ) { // numeric
			return;
		}

		event.preventDefault();
	}

	@HostListener( 'keydown.enter', [ '$event' ] )
	public triggerKeyDownEnter( event: KeyboardEvent ) {
		if ( this.saveable ) {
			event.stopPropagation();
			this.save();
		}
	}

	@HostListener( 'keydown.esc', [ '$event' ] )
	public triggerKeyDownEsc( event: KeyboardEvent ) {
		if ( this.cancelable ) {
			event.stopPropagation();
			this.cancel( event );
		}

		if ( this.clearable ) {
			event.stopPropagation();
			this.clear( event );
		}
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		this.stateChanges$.next();

		if ( !changes.ngModel ) return;

		this._bkValue = this.value = this.ngModel;
		// this._bkValue = this._checkValidValue( this.ngModel ) ? this.ngModel : this.value;

		this.changes$.next( this.value );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.elementRef.nativeElement.removeEventListener( 'paste', undefined );
		this.elementRef.nativeElement.addEventListener( 'paste', ( event: ClipboardEvent ) => {
			this.pasted.emit( event );
		} );
	}

	/**
	 * @constructor
	 * @param {any} value
	 */
	public onChanged( value: any ) {
		// Serialize value
		value = this._serialize( value );

		// Trim value
		value = this._trim( value );

		// Trigger value change
		this.onChange( value );
		this.changed.emit( value );
		this.changes$.next( value );
	}

	/**
	 * @constructor
	 * @param {any} value
	 */
	public writeValue( value: any ) {
		// Serialize value
		value = this._serialize( value );

		// Trim value
		value = this._trim( value );

		// Write new value
		!this._compareValue( value, this.value ) && super.writeValue( value );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public focus( event?: Event ) {
		this.elementRef.nativeElement.focus( event );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public blur( event?: Event ) {
		this.elementRef.nativeElement.blur( event );
	}

	/**
	 * @return {void}
	 */
	public save() {
		if ( this.formControl?.invalid ) return;

		this._convertValue( this.value );
		this.saved.emit( this.value );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public cancel( event?: Event ) {
		const value: any = this._bkValue;

		this._bkValue = undefined;

		this.blur( event );
		this.writeValue( value );
		this.onChanged( value );
		this.cancelled.emit( value );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public clear( event?: Event ) {
		const value: boolean = this._serialize( '' );

		!this.hasValue && this.blur( event );
		this.writeValue( value );
		this.onChanged( value );
		this.cleared.emit( value );
	}

	/**
	 * @param {any} value
	 * @return {boolean}
	 */
	@Memoize()
	private _checkValidValue( value: any ): boolean {
		if ( _.isNumber( value ) ) return _.isFinite( value );

		if ( _.isString( value ) ) return !!_.trim( value ).length;

		return false;
	}

	/**
	 * @param {string} source
	 * @param {string} string
	 * @return {boolean}
	 */
	@Memoize()
	private _compareValue( source: any, destination: any ): boolean {
		source = _.isStrictEmpty( source ) ? '' : String( source );
		destination = _.isStrictEmpty( destination ) ? '' : String( destination );

		return source === destination;
	}

	/**
	 * @param {any} value
	 * @return {any}
	 */
	private _trim( value: any ): any {
		return this.trim && this.type !== 'password' && _.isString( value ) ? _.trim( value ) : value;
	}

	/**
	 * @param {any} value
	 * @return {any}
	 */
	private _serialize( value: any ): any {
		if ( !this.isNumberInput || !this.hasValue ) return value;

		value = parseFloat( value );

		if ( _.isFinite( this.min ) && value < this.min ) value = this.min;
		if ( _.isFinite( this.max ) && value > this.max ) value = this.max;

		return _.isFinite( value ) ? value : null;
	}

	/**
	 * @return {void}
	 */
	private _convertTimeString() {
		let value: any = this.value;
		let hour: number = 0;
		let min: number = 0;
		let sec: number = 0;
		let totalMins: number = 0;
		let totalSeconds: number = 0;
		let totalMiliseconds: number = 0;

		// Years matching
		_.forEach( _.matchAll( yearsRegex, value ), ( yearsMatch: RegExpExecArray ) => {
			hour += Number( yearsMatch[ 1 ] ) * 8765;
		} );

		value = _.replace( value, yearsRegex, '' );

		// Months matching
		_.forEach( _.matchAll( monthsRegex, value ), ( monthsMatch: RegExpExecArray ) => {
			hour += Number( monthsMatch[ 1 ] ) * 720;
		} );

		value = _.replace( value, monthsRegex, '' );

		// Weeks matching
		_.forEach( _.matchAll( weeksRegex, value ), ( weekMatch: RegExpExecArray ) => {
			hour += Number( weekMatch[ 1 ] ) * 168;
		} );

		value = _.replace( value, weeksRegex, '' );

		// Days matching
		_.forEach( _.matchAll( daysRegex, value ), ( dayMatch: RegExpExecArray ) => {
			hour += Number( dayMatch[ 1 ] ) * 24;
		} );

		value = _.replace( value, daysRegex, '' );

		// Hours matching
		_.forEach( _.matchAll( hoursRegex, value ), ( hoursMatch: RegExpExecArray ) => {
			hour += Number( hoursMatch[ 1 ] );
		} );

		value = _.replace( value, hoursRegex, '' );

		// Minutes matching
		_.forEach( _.matchAll( minsRegex, value ), ( minsMatch: RegExpExecArray ) => {
			min += Number( minsMatch[ 1 ] );
		} );

		value = _.replace( value, minsRegex, '' );

		// Seconds matching
		_.forEach( _.matchAll( secondsRegex, value ), ( secsMatch: RegExpExecArray ) => {
			sec += Number( secsMatch[ 1 ] );
		} );

		value = _.replace( value, secondsRegex, '' );

		const arr: string[] = [];

		hour && arr.push( `${hour}h` );
		min && arr.push( `${min}m` );
		sec && arr.push( `${sec}s` );

		totalMins = hour * 60 + min;
		totalSeconds = totalMins * 60 + sec;
		totalMiliseconds = totalSeconds * 1000;

		value = arr.length ? `${_.join( arr, ' ' )} ${_.trim( value )}` : value;

		this.writeValue( value );
		this.onChanged( value );
		this.converted.emit({
			hour, min, sec,
			totalMins, totalSeconds, totalMiliseconds,
			type: this.convertType,
		});
	}

	/**
	 * @return {void}
	 */
	private _convertHourString() {
		const date: Moment = moment( this.value, this.timeFormat );
		let hour: number;
		let min: number;

		if ( !date.isValid() ) {
			hour = ( date as any )._a?.[ 3 ] || 0;
			min = ( date as any )._a?.[ 4 ] || 0;
		} else {
			hour = date.hour();
			min = date.minute();
		}

		if ( _.isNaN( hour ) || _.isNaN( min ) ) return;

		const value: string = moment().hour( hour ).minute( min ).format( this.timeFormat );
		const sec: number = 0;
		const totalMins: number = hour * 60 + min;
		const totalSeconds: number = totalMins * 60;
		const totalMiliseconds: number = totalSeconds * 1000;

		this.writeValue( value );
		this.onChanged( value );
		this.converted.emit({
			hour, min, sec,
			totalMins, totalSeconds, totalMiliseconds,
			type: this.convertType,
		});
	}

	/**
	 * @param {string} value
	 * @return {void}
	 */
	private _convertValue( value: string ) {
		switch ( this.convertType ) {
			case 'time-string':
				this._convertTimeString();
				break;
			case 'hour-string':
				this._convertHourString();
				break;
			default:
				// this.writeValue( value );
				this.onChanged( value );
		}
	}

}
