import {
	Injectable,
	inject
} from '@angular/core';
import {
	Router
} from '@angular/router';
import _ from 'lodash';

import {
	PageService
} from '@core';

import {
	AuthService
} from '@main/auth/services';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';

@Injectable({ providedIn: 'root' })
export class WorkspaceGrantService {

	private readonly _router: Router
		= inject( Router);
	private readonly _pageService: PageService
		= inject( PageService);
	private readonly _authService: AuthService
		= inject( AuthService);

	/**
	 * @return {boolean}
	 */
	public canActivateChild(): boolean {
		const isWorkspaceAccessed: boolean
			= this._authService.isWorkspaceAccessed;

		if ( !isWorkspaceAccessed ) {
			const pathNames: string[]
				= window.location.pathname.split( '/' );
			const workspaceID: string
				= pathNames[ 2 ];

			if (
				this._authService.isAccountAccessed
			) {
				this._pageService.setCurrentURL();
			}

			this._router.navigate([
				WORKSPACE_CONSTANT.PATH.MAIN,
				workspaceID,
			]);
		}

		return isWorkspaceAccessed;
	}

}
