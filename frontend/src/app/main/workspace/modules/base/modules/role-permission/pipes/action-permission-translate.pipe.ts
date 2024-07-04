import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { ActionType } from '../resources';

@Pipe({ name: 'actionPermissionTranslate' })
export class ActionPermissionTranslatePipe implements PipeTransform {

	public static ACTION_PERMISSION_CONSTANT: { [ key in ActionType ]: string } = {
		[ ActionType.NONE ]		: 'NONE',
		[ ActionType.CAN_EDIT ]	: 'CAN_EDIT',
		[ ActionType.CAN_VIEW ]	: 'CAN_VIEW',
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
	public transform( access: ActionType = ActionType.NONE ): string {
		return this._translateService.instant(
			`BASE.ROLE_PERMISSION.LABEL.${ActionPermissionTranslatePipe.ACTION_PERMISSION_CONSTANT[ access ]}`
		);
	}

}
