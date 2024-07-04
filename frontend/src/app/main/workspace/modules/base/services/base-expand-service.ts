import {
	Injectable
} from '@angular/core';

import {
	CUBDialogDirection,
	CUBDialogService
} from '@cub/material/dialog';

import {
	IBase
} from '@main/workspace/modules/base/interfaces';

import {
	DialogRolePermissionComponent
} from '../modules/role-permission/components';
import {
	DialogWorkflowComponent
} from '../modules/workflow/components';

@Injectable()
export class BaseExpandService {

	private _base: IBase;

	/**
	 * @constructor
	 * @param {CUBDialogService} _cubDialogService
	 */
	constructor(
		private _cubDialogService: CUBDialogService
	) {}

	/**
	 * @param {IBase} base
	 * @return {void}
	 */
	public setBase( base: IBase ) {
		this._base = base;
	}

	/**
	 * @return {void}
	 */
	public openDialogRolePermission() {
		this._cubDialogService
		.open(
			DialogRolePermissionComponent,
			{
				base: this._base,
			},
			{
				overlayConfig: {
					width: '640px',
				},
			}
		);
	}

	/**
	 * @return {void}
	 */
	public openDialogWorkflow() {
		this._cubDialogService
		.open(
			DialogWorkflowComponent,
			{
				base: this._base,
			},
			{
				direction: CUBDialogDirection.Vertical,
				overlayConfig: {
					hasBackdrop: true,
				},
			}
		);
	}

}
