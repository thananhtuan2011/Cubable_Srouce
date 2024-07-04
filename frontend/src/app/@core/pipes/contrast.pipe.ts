import { PipeTransform, Pipe } from '@angular/core';

import { Memoize, IsContrastPipe } from 'angular-core';

import { COLOR } from '@resources';

@Pipe({ name: 'contrast' })
export class ContrastPipe extends IsContrastPipe implements PipeTransform {

	/**
	 * @param {string} hex
	 * @param {string} textColor
	 * @return {any}
	 */
	@Memoize()
	public transform( hex: string, textColor?: string ): any {
		if ( !hex ) return textColor;

		return super.transform( hex )
			? COLOR.WHITE
			: ( textColor || COLOR.TEXT );
	}

}
