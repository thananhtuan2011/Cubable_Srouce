import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FieldManageType } from '../resources';

@Pipe({ name: 'fieldManageTranslate' })
export class FieldManageTranslatePipe implements PipeTransform {

	public static FIELD_MANAGE_CONSTANT: { [ key in FieldManageType ]: string } = {
		[ FieldManageType.ALL ]						: 'ALL_ROWS',
		[ FieldManageType.ASSIGNED_TO_THEM ]		: 'ROWS_ASSIGNED_TO_THEM',
		[ FieldManageType.CREATED_BY_THEMSELVES ]	: 'ROWS_CREATED_BY_THEMSELVES',
		[ FieldManageType.NONE ]					: 'NONE',
	};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {FieldManageType} type
	 * @return {string}
	 */
	public transform( type: FieldManageType = FieldManageType.NONE ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${FieldManageTranslatePipe.FIELD_MANAGE_CONSTANT[ type ]}` );
	}

}
