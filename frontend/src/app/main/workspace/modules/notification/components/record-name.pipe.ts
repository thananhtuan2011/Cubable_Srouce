import {
	Pipe,
	PipeTransform,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';
import {
	Notification
} from '../interfaces';

@Pipe({
	name: 'recordName',
})
export class RecordNamePipe
implements PipeTransform {

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	/**
	 * @param {ComparisonOperator} operator
	 * @return {string}
	 */
	@Memoize()
	public transform(
		notification: Notification
	): string {
		let recordName: string;

		if ( notification.metadata.recordName ) {
			recordName = notification.metadata.recordName;
		} else if ( !notification.metadata.permissionOnPrimaryField ) {
			recordName
				= this._translateService.instant(
					'NOTIFICATION.LABEL.UNDEFINED_NAME'
				);
		} else {
			recordName
				= this._translateService.instant(
					'NOTIFICATION.LABEL.NO_NAME'
				);
		}

		return recordName;
	}

}
