import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ViewManageType } from '../resources';

@Pipe({ name: 'viewManageTranslate' })
export class ViewManageTranslatePipe implements PipeTransform {

	public static VIEW_MANAGE_CONSTANT: { [ key in ViewManageType ]: string } = {
		[ ViewManageType.ACCESS_VIEW ]				: 'ACCESS_VIEW',
		[ ViewManageType.CREATED_BY_THEMSELVES ]	: 'VIEW_CREATED_BY_THEMSELVES',
	};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {ViewManageType} type
	 * @return {string}
	 */
	public transform( type: ViewManageType = ViewManageType.ACCESS_VIEW ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${ViewManageTranslatePipe.VIEW_MANAGE_CONSTANT[ type ]}` );
	}

}
