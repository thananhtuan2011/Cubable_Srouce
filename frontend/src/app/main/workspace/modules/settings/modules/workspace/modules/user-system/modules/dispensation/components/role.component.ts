import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	inject,
	ChangeDetectorRef
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	forkJoin
} from 'rxjs';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBMemberData,
	CUBTMember
} from '@cub/material/member-picker';

import {
	IUserTable
} from '../../user/interfaces';
import {
	UserService
} from '../../user/services';
import {
	TeamService
} from '../../team/services';
import {
	ITeam
} from '../../team/interfaces';

import {
	IRole,
	IRoleExtra,
	Role,
	UpdateRoleMember
} from '../interfaces';
import {
	CONSTANT
} from '../resources';
import {
	RoleService
} from '../services';

@Unsubscriber()
@Component({
	selector: 'role',
	templateUrl: '../templates/role.pug',
	styleUrls: [ '../styles/role.scss' ],
	host: { class: 'role' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleComponent implements OnInit {

	protected readonly ROLE_UNIQ_NAME: typeof CONSTANT.ROLE_UNIQ_NAME
		= CONSTANT.ROLE_UNIQ_NAME;

	protected disableClose: boolean;
	protected roles: IRoleExtra[];
	protected users: IUserTable[];
	protected teams: ITeam[];
	protected rolesDefault: ReadonlyMap<string, Omit<IRole, 'id'>>;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );

	ngOnInit() {
		forkJoin([
			this._roleService.get(),
			this._userService.getUserResource(),
			this._teamService.getTeams(),
		])
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: (
				[ roles, users, teams ]: [ Role[], IUserTable[], ITeam[] ]
			) => {
				this.rolesDefault
					= this._roleService.rolesDefault;

				_.forEach(
					roles,
					( role: IRoleExtra ) => {
						role.selectedUsers
							= _.filter(
								_.cloneDeep( users ),
								( user: IUserTable ) => {
									if (
										user.isOwner
										&& role.uniqName
											=== CONSTANT
											.ROLE_UNIQ_NAME
											.ADMIN
									) {
										( user as unknown as CUBTMember )
										.cannotRemove = true;
										( user as unknown as CUBTMember )
										.role
											= {
												name: this
												._translateService
												.instant(
													'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.LABEL.OWNER'
												),
											};
									}

									if (
										role.uniqName === CONSTANT
										.ROLE_UNIQ_NAME
										.ADMIN
										&& user.id
											=== this
											._userService
											.storedUser
											.user
											.id
									) {
										( user as unknown as CUBTMember )
										.cannotRemove = true;
									}

									return _.includes(
										role.userIDs,
										user.id
									) && (
										user.status
											=== CONSTANT.USER_STATUS.ACTIVE
										|| user.status
											=== CONSTANT.USER_STATUS.INACTIVE
									);
								}
							);

						role.selectedUsers = _.sortBy(
							role.selectedUsers,
							( user: IUserTable ) => {
								return ( user as unknown as CUBTMember ).role;
							}
						);
					}
				);

				this.users = _.filter(
					users,
					( user: IUserTable ) =>
						user.status === CONSTANT.USER_STATUS.ACTIVE
						|| user.status === CONSTANT.USER_STATUS.INACTIVE
				);
				this.teams = teams;
				this.roles = roles;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Role} role
	 * @param {boolean} isActiveRole
	 * @return {void}
	 */
	protected switchRole(
		role: Role,
		isActiveRole: boolean
	 ) {
		isActiveRole
			? this._activate( role )
			: this._deactivate( role );
	}

	/**
	 * @param {CUBMemberData} event
	 * @param {IRoleExtra} role
	 * @return {void}
	 */
	protected invite(
		event: CUBMemberData<CUBTMember[]>,
		role: IRoleExtra
	) {
		const roleBk: IRoleExtra = _.cloneDeep( role );
		const data: UpdateRoleMember = {};

		if ( event.users?.length ) {
			data.userIDs
				= _.map( event.users, 'id' );
			role.userIDs
				= [
					...( role.userIDs || [] ),
					...data.userIDs,
				];

			role.selectedUsers
				= [
					...( role.selectedUsers || [] ),
					...event.users,
				] as IUserTable[];
		}

		if (
			event.teams?.length
		) {
			data.teamIDs
				= _.map( event.teams, 'id' );
			role.teamIDs
				= [
					...( role.teamIDs || [] ),
					...data.teamIDs,
				];

			role.selectedTeams
				= [
					...( role.selectedTeams || [] ),
					...event.teams,
				] as ITeam[];
		}

		this._roleService
		.addMember( role.id, data )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				role.userIDs = roleBk.userIDs;
				role.selectedUsers = roleBk.selectedUsers;
				role.teamIDs = roleBk.teamIDs;
				role.selectedTeams = roleBk.selectedTeams;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {CUBMemberData} event
	 * @param {IRoleExtra} role
	 * @return {void}
	 */
	public remove(
		event: CUBMemberData<any>,
		role: IRoleExtra
	) {
		const roleBk: IRoleExtra
			= _.cloneDeep( role );
		const data: UpdateRoleMember = {};

		if ( event.users?.length ) {
			data.userIDs
				= _.map( event.users, 'id' );
			role.userIDs
				= _.difference( role.userIDs, data.userIDs );

			const usersLk: Record<CUBTMember[ 'id' ], CUBTMember>
				= _.keyBy( event.users, 'id' );

			_.remove(
				role.selectedUsers,
				( selected: IUserTable ) => !!usersLk[ selected.id ]
			);
		}

		if ( event.teams?.length ) {
			data.teamIDs
				= _.map( event.teams, 'id' );
			role.teamIDs
				= _.difference( role.teamIDs, data.teamIDs );

			const teamsLk: Record<ITeam[ 'id' ], ITeam>
				= _.keyBy( event.teams, 'id' );

			_.remove(
				role.selectedTeams,
				( selected: ITeam ) => !!teamsLk[ selected.id ]
			);
		}

		this._roleService
		.removeMember( role.id, data )
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			error: () => {
				role.userIDs = roleBk.userIDs;
				role.selectedUsers = roleBk.selectedUsers;
				role.teamIDs = roleBk.teamIDs;
				role.selectedTeams = roleBk.selectedTeams;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Role} role
	 * @return {void}
	 */
	private _activate(
		role: Role
	) {
		role.isActive = true;

		this._roleService
		.activate( role.id )
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			error: () => {
				role.isActive = false;
			},
		});
	}

	/**
	 * @param {Role} role
	 * @param {Role} roleBK
	 * @return {void}
	 */
	private _deactivate(
		role: Role
	) {
		role.isActive = false;

		this._roleService
		.deactivate( role.id )
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			error: () => {
				role.isActive = true;
			},
		});
	}
}
