import {
	Component, ContentChild, Input,
	ViewEncapsulation, Output, EventEmitter,
	AfterContentInit, OnChanges, SimpleChanges,
	ChangeDetectionStrategy, HostBinding, ChangeDetectorRef,
	ViewChild
} from '@angular/core';
import { FormControlDirective, FormControlStatus } from '@angular/forms';
import { merge, Observable } from 'rxjs';
import { takeWhile, delay, distinctUntilChanged } from 'rxjs/operators';
import _ from 'lodash';

import { DefaultValue, CoerceBoolean, Unsubscriber, untilCmpDestroyed } from '@core';

import { COLOR } from '@resources';

import { WGCTooltipDirective } from '../../wgc-tooltip';

import { WGCFormFieldInputDirective } from '../form-field-input/wgc-form-field-input.directive';
import { WGCFormFieldErrorDirective } from '../form-field-error/wgc-form-field-error.directive';

export type WGCIFormFieldAppearance = 'default' | 'standard' | 'legacy';
export type WGCIFormFieldErrorDisplayMode = 'default' | 'inline';

const NUMBER_OR_SYMBOL_REGEX: RegExp = /[0-9$-/:-?{-~!@#"^_`\[\]\\]/g;
const LOWERCASE_REGEX: RegExp = /[a-z]+/g;
const UPPERCASE_REGEX: RegExp = /[A-Z]+/g;

@Unsubscriber()
@Component({
	selector		: 'wgc-form-field',
	templateUrl		: './wgc-form-field.pug',
	styleUrls		: [ './wgc-form-field.scss' ],
	host			: { class: 'wgc-form-field' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCFormFieldComponent implements AfterContentInit, OnChanges {

	@HostBinding( 'style.--input-text-alignment' )
	get styleInputTextAlign(): string { return this.formFieldInput?.alignment; }

	@HostBinding( 'style.--input-text-size' )
	get styleInputTextSize(): string { return this.formFieldInput?.textSize; }

	@HostBinding( 'class.wgc-form-field--custom-error' )
	get classCustomError(): boolean { return !!this.formFieldError; }

	@HostBinding( 'class.wgc-form-field--valid' )
	get classValid(): boolean { return this.control?.valid && !this.formFieldError; }

	@HostBinding( 'class.wgc-form-field--invalid' )
	get classInvalid(): boolean { return this.control?.invalid || !!this.formFieldError; }

	@HostBinding( 'class.wgc-form-field--dirty' )
	get classDirty(): boolean { return this.control?.dirty; }

	@HostBinding( 'class.wgc-form-field--pristine' )
	get classPristine(): boolean { return this.control?.pristine; }

	@HostBinding( 'class.wgc-form-field--touched' )
	get classTouched(): boolean { return this.control?.touched; }

	@HostBinding( 'class.wgc-form-field--untouched' )
	get classUntouched(): boolean { return this.control?.untouched; }

	@HostBinding( 'class.wgc-form-field--enabled' )
	get classEnabled(): boolean { return this.control?.enabled; }

	@HostBinding( 'class.wgc-form-field--disabled' )
	get classDisabled(): boolean { return this.disabled || this.control?.disabled || this.formFieldInput?.disabled; }

	@HostBinding( 'class.wgc-form-field--readonly' )
	get classReadonly(): boolean { return this.readonly || this.formFieldInput?.readonly; }

	@HostBinding( 'class.wgc-form-field--focusing' )
	get classFocusing(): boolean { return this.focusing || this.formFieldInput?.focusing; }

	@HostBinding( 'class.wgc-form-field--textarea' )
	get classTextarea(): boolean { return this.formFieldInput?.isTextarea; }

	@HostBinding( 'class.wgc-form-field--empty' )
	get classEmpty(): boolean { return !this.formFieldInput?.hasValue; }

	@HostBinding( 'class.wgc-form-field--standard' )
	get classStandard(): boolean { return this.appearance === 'standard'; }

	@HostBinding( 'class.wgc-form-field--legacy' )
	get classLegacy(): boolean { return this.appearance === 'legacy'; }

	@ViewChild( 'inlineErrorTooltip' ) public inlineErrorTooltip: WGCTooltipDirective;

	@ContentChild( FormControlDirective ) public control: FormControlDirective;
	@ContentChild( WGCFormFieldInputDirective ) public formFieldInput: WGCFormFieldInputDirective;
	@ContentChild( WGCFormFieldErrorDirective ) public formFieldError: WGCFormFieldErrorDirective;

	@Input() public label: string;
	@Input() public dotColor: string;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public focusing: boolean;
	@Input() @CoerceBoolean() public fakeInput: boolean;
	@Input() @CoerceBoolean() public multiErrors: boolean;
	@Input() @CoerceBoolean() public displayColorDot: boolean;
	@Input() @CoerceBoolean() public togglePasswordVisibility: boolean;
	@Input() @CoerceBoolean() public checkWeekPassword: boolean;
	@Input() @DefaultValue() public appearance: WGCIFormFieldAppearance = 'default';
	@Input() @DefaultValue() public errorDisplayMode: WGCIFormFieldErrorDisplayMode = 'default';

	@Output() public dotColorChange: EventEmitter<string> = new EventEmitter<string>();

	public unhidePassword: boolean;
	public passwordHighlight: ObjectType<{ color: string; message: string }> = {
		25: {
			color	: COLOR.DANGER,
			message	: 'WGC.MESSAGE.PASSWORD_WEEK',
		},
		50: {
			color	: COLOR.WARNING,
			message	: 'WGC.MESSAGE.PASSWORD_MEDIUM_WEEK',
		},
		75: {
			color	: COLOR.WARNING,
			message	: 'WGC.MESSAGE.PASSWORD_MEDIUM',
		},
		100: {
			color	: COLOR.SUCCESS,
			message	: 'WGC.MESSAGE.PASSWORD_STRONG',
		},
	};
	public passwordRule: {
		minlength: boolean;
		numberOrSymbol: boolean;
		uppercase: boolean;
		lowercase: boolean;
		percent: number;
	} = {
			minlength		: false,
			numberOrSymbol	: false,
			uppercase		: false,
			lowercase		: false,
			percent			: 0,
		};

	get canAction(): boolean {
		return this.formFieldInput?.type !== 'range'
			&& !this.formFieldInput?.isTextarea
			&& !this.formFieldInput?.readonly
			&& !this.formFieldInput?.disabled
			&& !this.formFieldInput?.disableControl;
	}

	get canSave(): boolean {
		return this.formFieldInput?.saveable && this.canAction && this.formFieldInput?.hasValue && !this.control?.invalid;
	}

	get canCancel(): boolean {
		return this.formFieldInput?.cancelable && this.canAction;
	}

	get canClear(): boolean {
		return this.formFieldInput?.clearable && this.canAction && this.formFieldInput?.hasValue;
	}

	get canCheckWeekPassword(): boolean {
		return this.checkWeekPassword && this.formFieldInput?.hasValue;
	}

	get fieldName(): string {
		return this.formFieldInput?.name || this.label;
	}

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.disabled || !this.formFieldInput ) return;

		this.formFieldInput.isDisabledFromFormField = this.disabled;
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		const obs: Observable<any>[] = [];

		if ( this.formFieldInput ) {
			obs.push( this.formFieldInput.stateChanges$, this.formFieldInput.changes$ );

			this.formFieldInput.isDisabledFromFormField = this.disabled;

			this.formFieldInput.changes$
			.pipe(
				takeWhile( () => this.checkWeekPassword ),
				distinctUntilChanged(),
				untilCmpDestroyed( this )
			)
			.subscribe( ( password: string ) => {
				const minlength: boolean = password?.length >= 8;
				const numberOrSymbol: boolean = !!password.match( NUMBER_OR_SYMBOL_REGEX );
				const uppercase: boolean = !!password.match( UPPERCASE_REGEX );
				const lowercase: boolean = !!password.match( LOWERCASE_REGEX );
				const percent: number = _.chain([ minlength, numberOrSymbol, uppercase, lowercase ])
				.groupBy()
				.get( 'true' )
				.value()
				?.length * 25;

				this.passwordRule = {
					minlength, numberOrSymbol, uppercase,
					lowercase, percent,
				};

				this._cdRef.markForCheck();
			} );
		}

		if ( this.control ) {
			obs.push( this.control.statusChanges, this.control.valueChanges );

			if ( this.errorDisplayMode === 'inline' ) {
				this.control.statusChanges
				.pipe( delay( 0 ), untilCmpDestroyed( this ) )
				.subscribe( ( status: FormControlStatus ) => {
					if ( !this.inlineErrorTooltip ) return;

					if ( status !== 'INVALID' ) {
						this.inlineErrorTooltip.close();
						return;
					}

					!this.inlineErrorTooltip.isOpened && this.inlineErrorTooltip.open();
				} );
			}
		}

		merge( ...obs )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this._cdRef.markForCheck() );
	}

	/**
	 * @return {void}
	 */
	public togglePassword() {
		this.unhidePassword = !this.unhidePassword;

		this.formFieldInput.type = this.unhidePassword ? 'text' : 'password';
	}

}
