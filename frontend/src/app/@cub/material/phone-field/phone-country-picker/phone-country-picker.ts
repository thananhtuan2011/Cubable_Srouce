import {
	Directive,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {
	CountryCode
} from 'libphonenumber-js';
import moment
	from 'moment-timezone';
import _ from 'lodash';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBSearchBoxComponent
} from '../../search-box';

import {
	PhoneCountry,
	PHONE_COUNTRIES
} from './phone-countries';

function filterPhoneCountry(
	{
		name,
		code,
		dialCode,
	}: PhoneCountry,
	searchQuery: string
): boolean {
	return _.search( name, searchQuery )
		|| _.search( code, searchQuery )
		|| _.search( dialCode, searchQuery );
}

export type CUBCountryCode = CountryCode;
export type CUBPhoneCountry = PhoneCountry;

export function getDefaultCountryCode(): CountryCode {
	const tz: string
		= moment.tz.guess();
	const codes: CountryCode[]
		= ( moment.tz.zone( tz ) as any )
		.countries();
	let code: CountryCode = 'VN';

	if ( codes?.length
		&& _.indexOf( codes, code )
			=== -1 ) {
		let i: number = 0;

		do {
			code = codes[ i++ ];
		}
		while (
			code
				&& !_.find(
					PHONE_COUNTRIES,
					{ code }
				)
		);
	}

	return code;
}

@Directive()
export class CUBPhoneCountryPicker implements OnInit {

	@Input() public countryCode: CUBCountryCode;
	@Input() public defaultCountryCode: CUBCountryCode;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;

	@Output() public countryCodeChange:
		EventEmitter<CUBCountryCode>
		= new EventEmitter<CUBCountryCode>();
	@Output() public picked: EventEmitter<PhoneCountry>
		= new EventEmitter<PhoneCountry>();
	@Output() public opened: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event>
		= new EventEmitter<Event>();

	@ViewChild( CUBSearchBoxComponent )
	protected readonly searchBox:
		CUBSearchBoxComponent;

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly PHONE_COUNTRIES
		= PHONE_COUNTRIES;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly filterPredicate
		= filterPhoneCountry;

	protected phoneCountry: PhoneCountry;

	get previewText(): string {
		if ( !this.phoneCountry ) {
			return '';
		}

		const {
			name,
			dialCode,
		}: PhoneCountry
			= this.phoneCountry;

		return `${name} (+${dialCode})`;
	}

	ngOnInit() {
		if ( this.countryCode
			=== undefined ) {
			this
			.countryCodeChange
			.emit(
				this.countryCode
					= this.defaultCountryCode
						=== undefined
						? getDefaultCountryCode()
						: this.defaultCountryCode
			);
		}

		this.phoneCountry = _.find(
			PHONE_COUNTRIES,
			{ code: this.countryCode }
		);
	}

	/**
	 * @param {PhoneCountry} phoneCountry
	 * @return {void}
	 */
	protected changeCountryCode(
		phoneCountry: PhoneCountry
	) {
		this
		.countryCodeChange
		.emit(
			this.countryCode
				= phoneCountry?.code
					|| null
		);

		this.picked.emit(
			this.phoneCountry
				= phoneCountry
		);
	}

}
