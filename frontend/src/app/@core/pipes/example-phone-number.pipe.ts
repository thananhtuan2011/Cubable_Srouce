import { PipeTransform, Pipe } from '@angular/core';
import { getExampleNumber, isSupportedCountry, CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

import { Memoize } from 'angular-core';

import { ICountryCode } from '@resources';

@Pipe({ name: 'examplePhoneNumber' })
export class ExamplePhoneNumberPipe implements PipeTransform {

	/**
	 * @param {ICountryCode} countryCode
	 * @return {string}
	 */
	@Memoize()
	public transform( countryCode: ICountryCode ): string {
		if ( !countryCode ) return;

		return isSupportedCountry( countryCode )
			? getExampleNumber( countryCode as CountryCode, examples )?.formatNational()
			: undefined;
	}

}
