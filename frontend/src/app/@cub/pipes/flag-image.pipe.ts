import {
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	CountryCode
} from 'libphonenumber-js';
import _ from 'lodash';

import {
	Memoize
} from 'angular-core';

@Pipe({
	name: 'cubFlagImage',
	standalone: true,
})
export class CUBFlagImagePipe implements PipeTransform {

	/**
	 * Gets a country flag by a country code
	 * Support memoize
	 * @param countryCode
	 * @returns a country flag icon url
	 */
	@Memoize()
	public transform(
		countryCode: CountryCode
	): string {
		if ( !countryCode ) {
			return;
		}

		countryCode = (
			_
			.chain( countryCode )
			.upperCase()
			.replace( / /g, '-' )
			.value()
		) as CountryCode;

		return `assets/@cub/images/flags/${countryCode}.svg`;
	}

}
