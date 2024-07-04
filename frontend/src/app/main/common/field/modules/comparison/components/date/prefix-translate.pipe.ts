import {
	PipeTransform,
	Pipe
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	TimePeriodPrefixType
} from '../../resources/comparison';

@Pipe({ name: 'prefixTranslate' })
export class PrefixTranslatePipe
implements PipeTransform {

	public static PREFIX_CONSTANT: {
		[ key in TimePeriodPrefixType ]: string
	} = {
			[ TimePeriodPrefixType.THIS ]: 'THIS',
			[ TimePeriodPrefixType.LAST ]: 'LAST',
			[ TimePeriodPrefixType.NEXT ]: 'NEXT',
		};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {TimePeriodPrefixType=} access
	 * @return {string}
	 */
	public transform(
		access: TimePeriodPrefixType = TimePeriodPrefixType.LAST
	): string {
		return this._translateService
		.instant(
			`FIELD.COMPARISON.DATE_SPECIFIC.${
				PrefixTranslatePipe.PREFIX_CONSTANT[ access ]
			}`
		);
	}

}
