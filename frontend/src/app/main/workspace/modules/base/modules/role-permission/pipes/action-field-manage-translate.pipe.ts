import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { ActionFieldManageType } from '../resources';

@Pipe({ name: 'actionFieldManageTranslate' })
export class ActionFieldManageTranslatePipe implements PipeTransform {

	public static ACTION_FIELD_MANAGE_CONSTANT: { [ key in ActionFieldManageType ]: string } = {
		[ ActionFieldManageType.CAN_EDIT_ALL ]	: 'CAN_EDIT_ALL',
		[ ActionFieldManageType.CAN_VIEW_ALL ]	: 'CAN_VIEW_ALL',
		[ ActionFieldManageType.CUSTOM ]		: 'CUSTOM',
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
	public transform( access: ActionFieldManageType = ActionFieldManageType.CAN_EDIT_ALL ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${ActionFieldManageTranslatePipe.ACTION_FIELD_MANAGE_CONSTANT[ access ]}` );
	}

}
