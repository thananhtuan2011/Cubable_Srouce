import { PipeTransform, Pipe } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ViewAccessType } from '../resources';

@Pipe({ name: 'viewAccessTranslate' })
export class ViewAccessTranslatePipe implements PipeTransform {

	public static VIEW_ACCESS_CONSTANT: { [ key in ViewAccessType ]: string } = {
		[ ViewAccessType.CUSTOM ]					: 'CUSTOM_VIEW',
		[ ViewAccessType.CREATED_BY_THEMSELVES ]	: 'VIEW_CREATED_BY_THEMSELVES',
		[ ViewAccessType.ALL ]						: 'ALL_VIEWS',
	};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {ViewAccessType} type
	 * @return {string}
	 */
	public transform( type: ViewAccessType = ViewAccessType.CUSTOM ): string {
		return this._translateService.instant( `BASE.ROLE_PERMISSION.LABEL.${ViewAccessTranslatePipe.VIEW_ACCESS_CONSTANT[ type ]}` );
	}

}
