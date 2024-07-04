import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	forwardRef,
	inject,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import {
	FormControl,
	NG_VALIDATORS,
	ValidationErrors,
	Validator
} from '@angular/forms';
import {
	isSupportedCountry,
	parsePhoneNumberFromString,
	PhoneNumber
} from 'libphonenumber-js';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Memoize,
	validatePhone
} from 'angular-core';

import {
	CUBValueAccessor,
	CUB_VALUE_ACCESSOR
} from '../../value-accessor';
import {
	CUBFormFieldDisplayErrorMode,
	CUBFormFieldSize,
	CUBFormFieldVariant
} from '../../form-field';

import {
	CUBCountryCode
} from '../phone-country-picker/phone-country-picker';

export type CUBPhoneFieldSize
	= CUBFormFieldSize;
export type CUBPhoneFieldVariant
	= CUBFormFieldVariant;
export type CUBPhoneFieldDisplayErrorMode
	= CUBFormFieldDisplayErrorMode;

export type CUBPhoneValue = {
	phone: string;
	countryCode?: CUBCountryCode;
};

@Component({
	selector: 'cub-phone-field',
	templateUrl: './phone-field.pug',
	styleUrls: [ './phone-field.scss' ],
	host: { class: 'cub-phone-field' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		CUB_VALUE_ACCESSOR(
			CUBPhoneFieldComponent
		),
		{
			multi: true,
			provide: NG_VALIDATORS,
			useExisting: forwardRef(
				() => CUBPhoneFieldComponent
			),
		},
	],
})
export class CUBPhoneFieldComponent
	extends CUBValueAccessor<CUBPhoneValue>
	implements Validator {

	@Input() public tabindex: number = 0;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public helpText: string;
	@Input() public placeholder: string;
	@Input() public size: CUBPhoneFieldSize;
	@Input() public variant: CUBPhoneFieldVariant;
	@Input() public displayErrorMode:
		CUBPhoneFieldDisplayErrorMode;
	@Input() public defaultCountryCode: CUBCountryCode;
	@Input() @CoerceBoolean()
	public autoWidth: boolean;
	@Input() @CoerceBoolean()
	public includeOuterSize: boolean;
	@Input() @CoerceBoolean()
	public hideRequiredMarker: boolean;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public autoReset: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public clearable: boolean = true;
	@Input() @CoerceBoolean()
	public multiErrors: boolean;
	@Input() @CoerceBoolean()
	public phoneOnly: boolean;
	@Input() @CoerceBoolean()
	public autoFormatNational: boolean;

	@Output() public cleared: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public focus: EventEmitter<FocusEvent>
		= new EventEmitter<FocusEvent>();
	@Output() public blur: EventEmitter<FocusEvent>
		= new EventEmitter<FocusEvent>();

	protected phone: string;
	protected countryCode: CUBCountryCode;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	get isEmpty(): boolean {
		return !this.phone?.length;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override onErroringChanges() {
		this._cdRef.markForCheck();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue(
		value: CUBPhoneValue
	) {
		super.writeValue( value );

		this.phone = value?.phone;

		if ( value?.countryCode
			!== undefined ) {
			this.countryCode
				= value?.countryCode;
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	validate(
		c: FormControl<CUBPhoneValue>
	): ValidationErrors | null {
		return validatePhone(
			c.value?.phone
		)
			? null
			: { phone: true };
	}

	/**
	 * @param {string} phone
	 * @return {void}
	 */
	protected onPhoneChanged(
		phone: string
	) {
		this.control.markAsTouched();

		const value: CUBPhoneValue
			= this.value
				|| {} as CUBPhoneValue;

		value.phone
			= this.phone
				&& this.autoFormatNational
				? this._getNationalPhoneNumber(
					phone,
					this.countryCode
				)
				: phone;
		value.countryCode
			= this.countryCode;

		this.writeValue( value );
		this.onChange( value );
	}

	/**
	 * @param {CUBCountryCode} code
	 * @return {void}
	 */
	protected onCountryCodePicked(
		code: CUBCountryCode
	) {
		const value: CUBPhoneValue
			= this.value
				|| {} as CUBPhoneValue;

		value.countryCode = code;

		this.writeValue( value );

		if ( !this.phone ) {
			return;
		}

		this.onChange( value );
	}

	/**
	 * @return {void}
	 */
	protected onCleared() {
		this.cleared.emit();
	}

	/**
	 * @param {FocusEvent} e
	 * @return {void}
	 */
	protected onFocus(
		e: FocusEvent
	) {
		this.control.markAsTouched();

		this.focus.emit( e );
	}

	/**
	 * @param {FocusEvent} e
	 * @return {void}
	 */
	protected onBlur(
		e: FocusEvent
	) {
		this.blur.emit( e );
	}

	/**
	 * @param {string} phone
	 * @param {CUBCountryCode} countryCode
	 * @return {string}
	 */
	@Memoize()
	private _getNationalPhoneNumber(
		phone: string,
		countryCode: CUBCountryCode
	): string {
		if (
			!phone
				|| !isSupportedCountry(
					countryCode
				)
		) {
			return phone;
		}

		const phoneNumber: PhoneNumber
			= parsePhoneNumberFromString(
				phone,
				countryCode
			);

		return phoneNumber?.formatNational()
			|| phone;
	}

}
