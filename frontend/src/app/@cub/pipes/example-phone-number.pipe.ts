import {
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	CountryCode,
	getExampleNumber,
	isSupportedCountry,
	PhoneNumber
} from 'libphonenumber-js';
import examples
	from 'libphonenumber-js/examples.mobile.json';

import {
	Memoize
} from 'angular-core';

@Pipe({
	name: 'cubExamplePhoneNumber',
	standalone: true,
})
export class CUBExamplePhoneNumberPipe implements PipeTransform {

	/**
	 * Gets a example phone number by a country code
	 * Support memoize
	 * @param countryCode
	 * @returns A example phone number
	 */
	@Memoize()
	public transform(
		countryCode: CountryCode
	): string {
		if ( !countryCode
			|| !isSupportedCountry( countryCode ) ) {
			return;
		}

		const examplePhoneNumber: PhoneNumber
			= getExampleNumber( countryCode, examples );

		return examplePhoneNumber?.formatNational();
	}

}
