import { ChangeDetectorRef, Directive, inject } from '@angular/core';

import { untilCmpDestroyed } from '@core';

import { IWorkspace } from '@main/workspace/interfaces';
import { WorkspaceService } from '@main/workspace/services';

import { IUserData, IUserInfo, IUserRole } from './workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import { UserService } from './workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

@Directive()
export class MainComponent {

	protected readonly cdRef: ChangeDetectorRef = inject( ChangeDetectorRef );

	public user: IUserInfo;
	public workspace: IWorkspace;
	public userRole: IUserRole;

	get isOwner(): boolean {
		const userService: UserService = inject( UserService );

		return userService.isOwner();
	}

	get isAdmin(): boolean {
		const userService: UserService = inject( UserService );

		return userService.isAdmin();
	}

	get isAdministrator(): boolean { return this.isOwner || this.isAdmin; }

	/**
	 * @constructor
	 */
	constructor() {
		const userService: UserService = inject( UserService );
		const workspaceService: WorkspaceService = inject( WorkspaceService );

		userService.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( userData: IUserData ) => {
			if ( !userData ) return;

			this.user = userData.user;
			this.userRole = userData.user.role;

			this.cdRef.markForCheck();
		} );

		workspaceService.storedWorkspaceChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( workspace: IWorkspace ) => this.workspace = workspace );
	}

}
