import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { BoardPermissionType } from '../resources';

@Pipe({ name: 'boardPermissionTranslate' })
export class BoardPermissionTranslatePipe implements PipeTransform {

	public static BOARD_PERMISSION_CONSTANT: { [ key in BoardPermissionType ]: string } = {
		[ BoardPermissionType.NO_PERMISSION ]		: 'NO_PERMISSION',
		[ BoardPermissionType.VIEW_ONLY ]			: 'VIEW_ONLY',
		[ BoardPermissionType.CUSTOM ]				: 'CUSTOM_PERMISSION',
		[ BoardPermissionType.FULL_PERMISSION ]		: 'FULL_PERMISSION',
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
	public transform( access: BoardPermissionType = BoardPermissionType.NO_PERMISSION ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${BoardPermissionTranslatePipe.BOARD_PERMISSION_CONSTANT[ access ]}` );
	}

}
