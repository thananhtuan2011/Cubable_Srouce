import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	Injector,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	forkJoin
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	EqualValidators,
	Unsubscriber,
	generateUniqueName,
	untilCmpDestroyed
} from '@core';

import {
	CUB_DIALOG_CONTEXT,
	CUB_DIALOG_REF,
	CUBDialogRef
} from '@cub/material/dialog';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBTMember
} from '@cub/material/member-picker';

import {
	IBase
} from '@main/workspace/modules/base/interfaces';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';

import {
	IBoardPermission,
	IRole
} from '../interfaces';
import {
	RoleService
} from '../services';
import {
	BoardPermissionType,
	CONSTANT
} from '../resources';
import {
	PermissionComponent
} from './permission.component';

export interface IRoleExtra extends IRole {
	selectedUsers?: IUser[];
	selectedTeams?: ITeam[];
}

@Unsubscriber()
@Component({
	selector: 'dialog-role-permission',
	templateUrl: '../templates/dialog-role-permission.pug',
	styleUrls: [ '../styles/dialog-role-permission.scss' ],
	host: { class: 'dialog-role-permission' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogRolePermissionComponent implements OnInit {

	@ViewChild( 'permission' )
	protected permissionComponent: PermissionComponent;

	protected readonly boardPermissionType: typeof BoardPermissionType
		= BoardPermissionType;
	protected readonly ROLE_UNIQ_NAME: typeof CONSTANT.ROLE_UNIQ_NAME
		= CONSTANT.ROLE_UNIQ_NAME;
	protected readonly nameFormControl: FormControl = new FormControl(
		undefined,
		[
			Validators.required,
			Validators.maxLength( 80 ),
			EqualValidators.uniqueNameValidator(
				() => _.filter( this.roles, ( role: IRole ) => {
					return _.isStrictEmpty( this.accessedRole )
						? role.name !== this.roleName
						: role.name !== this.accessedRole.name;
				} ),
				false,
				'name'
			),
		]
	);

	protected isChanged: boolean;
	protected isSaved: boolean;
	protected isPermissionLayout: boolean;
	protected isSubmitting: boolean;
	protected isChangeRoleName: boolean;
	protected isRoleNameChange: boolean;
	protected roleName: string;
	protected base: IBase;
	protected users: IUser[];
	protected teams: ITeam[];
	protected accessedRole: IRole;
	protected accessedBoard: IBoardPermission;
	protected bkAccessBoard: IBoardPermission;
	protected roles: IRoleExtra[];

	/**
	 * @constructor
	 * @param {ObjectType} data
	 * @param {CUBDialogRef} dialogRef
	 * @param {Injector} injector
	 * @param {TranslateService} _translateService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {RoleService} _roleService
	 * @param {UserService} _userService
	 * @param {TeamService} _teamService
	 * @param {CUBConfirmService} _confirmService
	 */
	constructor(
		@Inject( CUB_DIALOG_CONTEXT ) protected data: { base: IBase },
		@Inject( CUB_DIALOG_REF ) protected dialogRef: CUBDialogRef,
		protected injector: Injector,
		private _translateService: TranslateService,
		private _cdRef: ChangeDetectorRef,
		private _roleService: RoleService,
		private _userService: UserService,
		private _teamService: TeamService,
		private _confirmService: CUBConfirmService
	) {
		this.base = this.data.base;
	}

	ngOnInit() {
		this._roleService
		.get( this.data.base.id, true )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( roles: IRole[] ) => {
				const rolesDefaultLk: Record<IRole[ 'uniqName' ], IRole>
					= _.keyBy(
						this._roleService.getDefaultRoles(),
						'uniqName'
					);

				_.forEach( roles, ( role: IRole ) => {
					if ( rolesDefaultLk[ role.uniqName ] ) {
						role.description
							||= rolesDefaultLk[ role.uniqName ].description;
						role.name = rolesDefaultLk[ role.uniqName ].name;
					}
				} );

				this.roles = roles;

				this._cdRef.markForCheck();

				forkJoin([
					this._userService.getAvailableUser(),
					this._teamService.getAvailableTeams(),
				])
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: ( [ users, teams ]: [ IUser[], ITeam[] ] ) => {
						_.forEach( this.roles, ( role: IRoleExtra ) => {
							role.selectedUsers
								= _.filter(
									_.cloneDeep( users ),
									( user: IUser ) => {
										if (
											user.id === this.base.createdBy
											&& role.uniqName
												=== CONSTANT
												.ROLE_UNIQ_NAME
												.ADMIN
										) {
											( user as CUBTMember ).cannotRemove
												= true;
											( user as CUBTMember ).role
												= {
													name: this
													._translateService
													.instant(
														'BASE.ROLE_PERMISSION.LABEL.OWNER'
													),
												};
										}

										return _.includes(
											role.userIDs,
											user.id
										);
									}
								);
							role.selectedTeams
								= _.filter(
									teams,
									( team: ITeam ) =>
										_.includes( role.teamIDs, team.id )
								);
						} );

						this.users = users;
						this.teams = teams;
						this.roles = [ ...this.roles ];

						this._cdRef.markForCheck();
					},
				});
			},
		});
	}

	/**
	 * @param {boolean} isClose
	 * @return {void}
	 */
	protected closeAndBack( isClose?: boolean ) {
		if (
			( !this.nameFormControl.dirty && !this.isChanged )
			|| ( this.accessedBoard && !isClose )
			|| ( this.permissionComponent.role.id && !this.isChanged )
			||
				(
					this.permissionComponent.role.id
					&&
						(
							(
								this.bkAccessBoard?.permission.type
									=== this.boardPermissionType.CUSTOM
								|| this.bkAccessBoard?.permission.type
									=== this.boardPermissionType.VIEW_ONLY
							)
							&& !this.permissionComponent.isChangedDetail
						)
				)
		) {
			!isClose ? this._back() : this.dialogRef.close();

			return;
		};

		this._confirmService
		.open(
			'BASE.ROLE_PERMISSION.MESSAGE.BACK_CONFIRM',
			'BASE.ROLE_PERMISSION.LABEL.BACK_CONFIRM',
			{
				warning			: true,
				buttonDiscard	: 'BASE.ROLE_PERMISSION.LABEL.KEEP',
				buttonApply: {
					text: 'BASE.ROLE_PERMISSION.LABEL.CANCEL_CONFIRM',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				!isClose ? this._back() : this.dialogRef.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected save() {
		this.isSubmitting = true;

		if ( !this.permissionComponent.role?.id ) {
			this._create();

			return;
		}


		this._update();
	}

	/**
	 * @return {void}
	 */
	protected accessPermission( role: IRole ) {
		this.isPermissionLayout = false;
		this.accessedRole = role;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected setCollectionRoleData( event: IRole[] ) {
		this.roles = event;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected createNewRole() {
		this.isPermissionLayout = this.isRoleNameChange = true;
		this.accessedRole = undefined;

		this.roleName = generateUniqueName(
			_.map( this.roles, 'name' ),
			this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.NAME_DEFAULT' ),
			80,
			( idx: number ): string => idx ? ` ${idx}` : ` 1`
		);
	}

	/**
	 * @return {void}
	 */
	private _create() {
		this._roleService
		.create({
			baseID: this.data.base.id,
			name: this.roleName,
			permissions	: [ ...this.permissionComponent.role.permissions ],
		})
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( role: IRole ) => {
				this.isSaved = true;
				role = {
					...role,
					isActive: true,
				};
				this.roles.push( role );

				this._back();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _update() {
		this._roleService
		.update(
			this.permissionComponent.role.id,
			{
				name		: this.roleName,
				permissions	: [ ...this.permissionComponent.role.permissions ],
			}
		)
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				if (
					( this.accessedRole.name !== this.roleName )
					&& this.roleName
				) {
					this.roles[
					_.findIndex( this.roles, { id: this.accessedRole.id } )
					].name = this.roleName;
				}

				this.isSaved = true;

				this._back();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _back() {
		if ( !_.isStrictEmpty( this.accessedBoard ) && !this.isSaved ) {
			this.accessedBoard = undefined;

			return;
		};

		this.isPermissionLayout = this.isChanged = this.isSaved = false;
		this.accessedRole = undefined;
		this.accessedBoard = undefined;
		this.bkAccessBoard = undefined;

		this.nameFormControl.reset();

		this._cdRef.markForCheck();
	}

}
