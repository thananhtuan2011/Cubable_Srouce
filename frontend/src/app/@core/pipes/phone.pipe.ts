import { PipeTransform, Pipe } from '@angular/core';
import { parsePhoneNumberFromString, isSupportedCountry, PhoneNumber, CountryCode } from 'libphonenumber-js';

import { Memoize } from 'angular-core';

import { ICountryCode } from '@resources';

@Pipe({ name: 'phone' })
export class PhonePipe implements PipeTransform {

	/**
	 * @param {string} phone
	 * @param {ICountryCode} countryCode
	 * @return {string}
	 */
	@Memoize()
	public transform( phone: string, countryCode: ICountryCode ): string {
		if ( !phone || !isSupportedCountry( countryCode ) ) return phone;

		const phoneNumber: PhoneNumber = parsePhoneNumberFromString( phone, countryCode as CountryCode );

		return phoneNumber?.formatNational() || phone;
	}

}
