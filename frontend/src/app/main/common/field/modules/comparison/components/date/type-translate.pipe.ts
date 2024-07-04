import {
	PipeTransform,
	Pipe,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	TimePeriodPrefixType,
	TimePeriodType
} from '../../resources/comparison';

@Pipe({ name: 'typeTranslate' })
export class TypeTranslatePipe
implements PipeTransform {

	public static TYPE_CONSTANT: {
		[ key in TimePeriodType ]: string
	} = {
			[ TimePeriodType.DAY ]	: 'TODAY',
			[ TimePeriodType.MONTH ]: 'MONTH',
			[ TimePeriodType.WEEK ]	: 'WEEK',
			[ TimePeriodType.YEAR ]	: 'YEAR',
		};

	private _translateService: TranslateService
		= inject( TranslateService );

	/**
	 * @param {IAccessPermission=} access
	 * @return {string}
	 */
	public transform(
		access: TimePeriodType = TimePeriodType.DAY,
		prefix: TimePeriodPrefixType
	): string {
		if (
			( prefix === TimePeriodPrefixType.LAST
				|| prefix === TimePeriodPrefixType.NEXT )
			&& access === TimePeriodType.DAY
		) {
			return this._translateService
			.instant( `FIELD.COMPARISON.DATE_SPECIFIC.DAY` );

		} else {
			return this._translateService
			.instant(
				`FIELD.COMPARISON.DATE_SPECIFIC.${
					TypeTranslatePipe.TYPE_CONSTANT[ access ]
				}`
			);
		}

	}

}
