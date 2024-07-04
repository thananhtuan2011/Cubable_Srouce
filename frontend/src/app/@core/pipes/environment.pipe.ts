import { PipeTransform, Pipe } from '@angular/core';
import _ from 'lodash';

import { Memoize } from 'angular-core';

import { ENVIRONMENT } from '@environments/environment';

@Pipe({ name: 'environment' })
export class EnvironmentPipe implements PipeTransform {

	/**
	 * @param {string} propertyName
	 * @return {string}
	 */
	@Memoize()
	public transform( propertyName: string ): any {
		return _.get( ENVIRONMENT, propertyName );
	}

}
