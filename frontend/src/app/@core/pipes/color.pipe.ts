import { PipeTransform, Pipe } from '@angular/core';
import _ from 'lodash';

import { Memoize, RGB } from 'angular-core';

import { COLOR } from '@resources';

@Pipe({ name: 'color' })
export class ColorPipe implements PipeTransform {

	/**
	 * @param {string} name
	 * @param {number} weight
	 * @param {number} opacity
	 * @return {string}
	 */
	@Memoize()
	public transform( name: string, weight?: number, opacity?: number ): string {
		name = _.toUpper( name );
		name += weight ? `.${weight}` : '';

		let color: string = _.get( COLOR, name );

		if ( _.isFinite( opacity ) ) {
			const rgb: RGB = _.toRgb( color );

			color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
		}

		return color || name;
	}

}
