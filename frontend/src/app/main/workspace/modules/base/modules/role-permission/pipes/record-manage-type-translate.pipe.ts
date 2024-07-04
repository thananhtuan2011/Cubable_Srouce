import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { RecordManageType } from '../resources';

@Pipe({ name: 'recordManageTypeTranslate' })
export class RecordManageTypeTranslatePipe implements PipeTransform {

	public static ROW_MANGE_TYPE_CONSTANT: { [ key in RecordManageType ]: string } = {
		[ RecordManageType.ASSIGNED_TO_THEM ]		: 'ROWS_ASSIGNED_TO_THEM',
		[ RecordManageType.NONE ]					: 'NONE',
		[ RecordManageType.CREATED_BY_THEMSELVES ]	: 'ROWS_CREATED_BY_THEMSELVES',
		[ RecordManageType.ALL ]					: 'ALL_ROWS',
	};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {IAccessPermission} access
	 * @return {string}
	 */
	public transform( access: RecordManageType = RecordManageType.NONE ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${RecordManageTypeTranslatePipe.ROW_MANGE_TYPE_CONSTANT[ access ]}` );
	}

}
