import { PipeTransform, Pipe } from '@angular/core';
import _ from 'lodash';

import { Memoize } from 'angular-core';

import { ICountryCode } from '@resources';

@Pipe({ name: 'flagImage' })
export class FlagImagePipe implements PipeTransform {

	/**
	 * @param {ICountryCode} countryCode
	 * @return {string}
	 */
	@Memoize()
	public transform( countryCode: ICountryCode ): string {
		if ( !countryCode ) return;

		countryCode = ( _.chain( countryCode )
		.upperCase()
		.replace( / /g, '-' )
		.value() ) as ICountryCode;

		return `assets/images/flags/${countryCode}.svg`;
	}

}
