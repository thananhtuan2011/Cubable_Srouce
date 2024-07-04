import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	Router
} from '@angular/router';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	Observable,
	Observer
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed,
	EqualValidators
} from '@core';

import {
	CUBTMember,
	CUBMemberData
} from '@cub/material/member-picker';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBMenuComponent
} from '@cub/material/menu';
import {
	CUBToastService
} from '@cub/material/toast';
import {
	CUBDialogRef
} from '@cub/material/dialog';

import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

import {
	IBase
} from '../../../interfaces';
import {
	CONSTANT as BASE_CONSTANT
} from '../../../resources';

import {
	CONSTANT
} from '../resources';
import {
	IRole,
	RoleUpdate,
	UpdateRoleMember
} from '../interfaces';
import {
	RoleService
} from '../services';

import {
	IRoleExtra
} from './dialog-role-permission.component';

@Unsubscriber()
@Component({
	selector: 'role',
	templateUrl: '../templates/role.pug',
	styleUrls: [ '../styles/role.scss' ],
	host: { class: 'role' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleComponent {

	@ViewChild( 'editRolePopup' )
	public editRolePopup: CUBMenuComponent;

	@Input() @CoerceBoolean()
	public isCreateNewRole: boolean;
	@Input() @CoerceArray()
	public roles: IRoleExtra[];
	@Input() @CoerceArray()
	public users: IUser[];
	@Input() @CoerceArray()
	public teams: ITeam[];
	@Input() public base: IBase;
	@Input() public dialogRef: CUBDialogRef;

	@Output() public accessedRole: EventEmitter<IRoleExtra>
		= new EventEmitter<IRoleExtra>();
	@Output() public rolesChanged: EventEmitter<IRoleExtra[]>
		= new EventEmitter<IRoleExtra[]>();

	protected readonly nameFormControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.required,
				Validators.maxLength( 80 ),
				EqualValidators.uniqueNameValidator(
					() => _.filter( this.roles, ( role: IRole ) => {
						if ( this.nameFormControl.dirty ) {
							return role.name !== this.roleName;
						}
					} ),
					false,
					'name'
				),
			]
		);
	protected readonly descriptionFormControl: FormControl
		= new FormControl( undefined, [ Validators.maxLength( 255 ) ]);
	protected readonly ROLE_UNIQ_NAME: typeof CONSTANT.ROLE_UNIQ_NAME
		= CONSTANT.ROLE_UNIQ_NAME;

	protected isSubmitting: boolean;
	protected roleName: string;
	protected roleDescription: string;
	protected disableClose: boolean;
	protected optionAll: CUBTMember = {
		name: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.ALL_BASE_USERS' ),
	} as CUBTMember;

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _workspaceService: WorkspaceService
		= inject( WorkspaceService );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _router: Router
		= inject( Router );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor(
		private _translateService: TranslateService
	) {}

	/**
	 * @param {CUBMemberData} event
	 * @param {IRoleExtra} role
	 * @return {void}
	 */
	public invite( event: CUBMemberData<CUBTMember[]>, role: IRoleExtra ) {
		const roleBk: IRoleExtra = _.cloneDeep( role );
		const data: UpdateRoleMember = {};

		if ( event.all ) {
			data.isAllBaseUsersTeams = role.isAllBaseUsersTeams = true;
		}
		if ( event.users?.length ) {
			data.userIDs
				= _.map( event.users, 'id' );
			role.userIDs
				= [ ...( role.userIDs || [] ), ...data.userIDs ];
			role.selectedUsers
				= [
					...( role.selectedUsers || [] ),
					...event.users,
				] as IUser[];
		}
		if ( event.teams?.length ) {
			data.teamIDs
				= _.map( event.teams, 'id' );
			role.teamIDs
				= [ ...( role.teamIDs || [] ), ...data.teamIDs ];
			role.selectedTeams
				= [
					...( role.selectedTeams || [] ),
					...event.teams,
				] as ITeam[];
		}

		this._cdRef.markForCheck();

		this._roleService
		.inviteMember( role.id, data )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				role.userIDs = roleBk.userIDs;
				role.selectedUsers = roleBk.selectedUsers;
				role.teamIDs = roleBk.teamIDs;
				role.selectedTeams = roleBk.selectedTeams;
				role.isAllBaseUsersTeams = roleBk.isAllBaseUsersTeams;

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
		event: CUBMemberData<CUBTMember[]>,
		role: IRoleExtra
	) {
		const roleBk: IRoleExtra
			= _.cloneDeep( role );
		const data: UpdateRoleMember = {};

		if ( event.all ) {
			data.isAllBaseUsersTeams = true;
			role.isAllBaseUsersTeams = false;
		}
		if ( event.users?.length ) {
			data.userIDs
				= _.map( event.users, 'id' );
			role.userIDs
				= _.difference( role.userIDs, data.userIDs );

			const usersLk: Record<CUBTMember[ 'id' ], CUBTMember>
				= _.keyBy( event.users, 'id' );

			_.remove(
				role.selectedUsers,
				( selected: IUser ) => !!usersLk[ selected.id ]
			);
		}
		if ( event.teams?.length ) {
			data.teamIDs
				= _.map( event.teams, 'id' );
			role.teamIDs
				= _.difference( role.teamIDs, data.teamIDs );

			const teamsLk: Record<CUBTMember[ 'id' ], CUBTMember>
				= _.keyBy( event.teams, 'id' );

			_.remove(
				role.selectedTeams,
				( selected: ITeam ) => !!teamsLk[ selected.id ]
			);
		}

		this._cdRef.markForCheck();

		this._roleService
		.removeMember( role.id, data )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				if (
					!event.all
					&& data.userIDs?.indexOf(
						this._userService.storedUser.user.id
					) < 0
				) return;

				let roleNotAvailable: boolean = true;

				_.forEach(
					this.roles,
					( r: IRoleExtra ) => {
						if (
							r.isAllBaseUsersTeams
							|| r.userIDs?.indexOf(
								this._userService.storedUser.user.id
							) >= 0
						) {
							return roleNotAvailable = false;
						}
					}
				);

				if ( !roleNotAvailable ) return;

				this.dialogRef.close();

				this._toastService
				.info(
					'BASE.ROLE_PERMISSION.MESSAGE.BASE_NOT_AVAILABLE',
					{
						translate: { name: this.base.name },
					}
				);

				// TOTO need check navigate( '../.. )
				this._router.navigateByUrl(
					// eslint-disable-next-line max-len
					`${WORKSPACE_CONSTANT.PATH.MAIN}/${this._workspaceService.storedWorkspace.id}/${BASE_CONSTANT.PATH.MAIN}`
				);
			},
			error: () => {
				role.userIDs = roleBk.userIDs;
				role.selectedUsers = roleBk.selectedUsers;
				role.teamIDs = roleBk.teamIDs;
				role.selectedTeams = roleBk.selectedTeams;
				role.isAllBaseUsersTeams = roleBk.isAllBaseUsersTeams;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	public changeRoleName( name: string ) {
		if ( this.nameFormControl.dirty ) {
			this.roleName = name;
		}
	}

	/**
	 * @param {IRoleExtra} role
	 * @param {boolean=} isActiveRole
	 * @return {void}
	 */
	public update( role: IRoleExtra, isActiveRole?: boolean ) {
		if (
			(
				this.nameFormControl.invalid
				&& this.nameFormControl.dirty
			)
			|| this.descriptionFormControl.invalid
		) return;

		this.isSubmitting = true;

		const collectionRoleUpdate: RoleUpdate = {
			name		: this.roleName ? this.roleName : undefined,
			isActive	: isActiveRole,
			description	: this.roleDescription
				? this.roleDescription
				: undefined,
		};

		this._roleService
		.update( role.id, collectionRoleUpdate )
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				if ( isActiveRole || isActiveRole !== undefined ) {
					role.isActive = isActiveRole;

					return;
				}

				const indexOfRole: number
					= _.findIndex( this.roles, { id: role.id } );

				this.roleName
				&& ( this.roles[ indexOfRole ].name = this.roleName );

				this.roleDescription
				&& ( this.roles[ indexOfRole ].description
					= this.roleDescription );

				this.closeEditRolePopup();
			},
		});
	}

	public closeEditRolePopup( isForceClose?: boolean ) {
		this.roleName = undefined;
		this.roleDescription = undefined;

		if ( !isForceClose ) this.editRolePopup.close();
	}

	/**
	 * @param {IRoleExtra} role
	 * @return {void}
	 */
	public deleteRole( role: IRoleExtra ) {
		this._confirmService
		.open(
			'BASE.ROLE_PERMISSION.MESSAGE.REMOVE_ROLE_CONFIRM',
			'BASE.ROLE_PERMISSION.LABEL.REMOVE_ROLE',
			{
				warning			: true,
				buttonDiscard	: 'BASE.ROLE_PERMISSION.LABEL.KEEP',
				translate		: { roleName: role.name },
				buttonApply: {
					text: 'BASE.ROLE_PERMISSION.LABEL.REMOVE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.isSubmitting = true;

				const rolesBk: IRoleExtra[] = _.cloneDeep( this.roles );

				this.roles
					= _.filter(
						this.roles,
						( _role: IRoleExtra ) => role.id !== _role.id
					);

				this._cdRef.markForCheck();

				this._roleService
				.delete( role.id, this.base.id )
				.pipe(
					finalize( () => {
						this.isSubmitting = false;

						this._cdRef.markForCheck();
					} ),
					untilCmpDestroyed( this )
				)
				.subscribe({
					next: () => {
						this.rolesChanged.emit( this.roles );
						this._roleService.roles[ this.base.id ] = this.roles;
					},
					error: () => this.roles = _.cloneDeep( rolesBk ),
				});
			},
		});
	}

	/**
	 * @param {string} roleID
	 * @return {Observable}
	 */
	public getAvailableUsers( roleID: string ): Observable<IUser[]> {
		return new Observable( ( observer: Observer<IUser[]> ) => {
			this._roleService
			.availableUser( roleID )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( observer );
		} );
	}

	/**
	 * @param {string} roleID
	 * @return {Observable}
	 */
	public getAvailableTeams( roleID: string ): Observable<ITeam[]> {
		return new Observable( ( observer: Observer<ITeam[]> ) => {
			this._roleService
			.availableTeam( roleID )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( observer );
		} );
	}

	/**
	 * @param {IRoleExtra} role
	 * @return {void}
	 */
	public accessPermission( role: IRoleExtra ) {
		this.accessedRole.emit({
			id			: role.id,
			name		: role.name,
			permissions	: undefined,
			uniqName	: role.uniqName,
		});
	}

}
