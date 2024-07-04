import { Component, ChangeDetectionStrategy } from '@angular/core';

// import { UserPreferencesComponent } from '../modules/user-preferences/components';
import { WorkspaceSettingComponent } from '../modules/workspace/components';
import { UserService } from '../modules/workspace/modules/user-system/modules/user/services';

@Component({
	selector		: 'settings',
	templateUrl		: '../templates/settings.pug',
	styleUrls		: [ '../styles/settings.scss' ],
	host			: { class: 'settings' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {

	public selectedComp: WorkspaceSettingComponent;

	// get isUserComp(): boolean { return this.selectedComp instanceof UserPreferencesComponent; }

	get isWorkspaceComp(): boolean { return this.selectedComp instanceof WorkspaceSettingComponent; }

	get isAdministrator(): boolean { return this._userService.isAdministrator(); }

	/**
	 * @constructor
	 * @param {UserService} _userService
	 */
	constructor( private _userService: UserService ) {}

	/**
	 * @param {WorkspaceSettingComponent} event
	 * @return {void}
	 */
	public onActivate( event: WorkspaceSettingComponent ) {
		this.selectedComp = event;
	}

}
