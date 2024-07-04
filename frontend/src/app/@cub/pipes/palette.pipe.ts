import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize,
	RGB
} from 'angular-core';

const PREFIX: string = '--palette-';
const bodyStyles: CSSStyleDeclaration
	= window.getComputedStyle( document.body );

@Pipe({
	name: 'cubPalette',
	standalone: true,
})
export class CUBPalettePipe implements PipeTransform {

	/**
	 * Gets a color in palette by color key
	 * Support memoize
	 * @param key
	 * @param tone
	 * @param opacity
	 * @return A HEX or RGB of color
	 */
	@Memoize()
	public transform(
		key: string,
		tone: string,
		opacity?: number
	): string {
		const name: string
			= `${PREFIX}${key}-${tone}`;
		const hex: string
			= bodyStyles.getPropertyValue( name );

		if ( opacity ) {
			const rgb: RGB = _.toRgb( hex );

			return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
		}

		return hex;
	}

}
