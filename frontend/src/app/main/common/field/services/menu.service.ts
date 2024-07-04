import {
	ElementRef,
	inject,
	Injectable
} from '@angular/core';

import {
	CUBMenuConfig,
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';

import {
	FieldMenuComponent,
	FieldMenuContext
} from '../components';

@Injectable({ providedIn: 'any' })
export class FieldMenuService {

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	/**
	 * @param {ElementRef | HTMLElement} origin
	 * @param {FieldMenuContext=} context
	 * @param {CUBMenuConfig=} config
	 * @return {CUBMenuRef}
	 */
	public open(
		origin: ElementRef | HTMLElement,
		context?: FieldMenuContext,
		config?: CUBMenuConfig
	): CUBMenuRef {
		return this._menuService.open(
			origin,
			FieldMenuComponent,
			context,
			config
		);
	}

}
