import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	ViewChild,
	TemplateRef,
	OnDestroy,
	OnInit,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ActivatedRoute,
	Router
} from '@angular/router';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	finalize,
	take
} from 'rxjs/operators';
import {
	forkJoin
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBTMember,
	CUBMemberData
} from '@cub/material/member-picker';
import {
	CUBPopupComponent
} from '@cub/material/popup';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastService
} from '@cub/material/toast';

import {
	IError
} from '@error/interfaces';

import {
	NavigationBarService
} from '@main/common/navigation-bar/services';
import {
	CONSTANT as ROLE_PERMISSION_CONSTANT
} from '@main/workspace/modules/base/modules/role-permission/resources';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ITeam
} from '../../settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	UserService
} from '../../settings/modules/workspace/modules/user-system/modules/user/services';
import {
	TeamService
} from '../../settings/modules/workspace/modules/user-system/modules/team/services';

import {
	IBase
} from '../interfaces';
import {
	IRole
} from '../modules/role-permission/interfaces';
import {
	RoleService
} from '../modules/role-permission/services';
import {
	NotificationService
} from '../../notification/services';
import {
	BaseExpandService,
	BaseRoleService,
	BaseService
} from '../services';

@Unsubscriber()
@Component({
	selector: 'detail',
	templateUrl: '../templates/detail.pug',
	styleUrls: [ '../styles/detail.scss' ],
	host: { class: 'detail' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent
implements OnDestroy, OnInit {

	@ViewChild( 'contentTmp' )
	public contentTmpRef: TemplateRef<any>;
	@ViewChild( 'sharePopup' )
	public popupComponent: CUBPopupComponent;

	protected readonly baseNameFormControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.required,
				Validators.maxLength( 255 ),
			]
		);

	protected isSubmitting: boolean;
	protected loadedRole: boolean;
	protected newBaseName: string;
	protected roleIDSelected: ULID;
	protected base: IBase;
	protected roles: IRole[];
	protected users: IUser[];
	protected teams: ITeam[];
	protected selectedUsers: CUBTMember[];
	protected selectedTeams: CUBTMember[];
	protected availableSelectedUserIDs: ULID[];
	protected availableSelectedTeamIDs: ULID[];
	protected baseExpandService: BaseExpandService
		= inject( BaseExpandService );

	private _addedUserIDs: ULID[];
	private _addedTeamIDs: ULID[];

	private readonly _navigationBarService: NavigationBarService
		= inject( NavigationBarService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _router: Router
		= inject( Router );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _baseService: BaseService
		= inject( BaseService );
	private readonly _baseRoleService: BaseRoleService
		= inject( BaseRoleService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _notificationService: NotificationService
		= inject( NotificationService );

	get isChanged(): boolean {
		return !!this._addedUserIDs?.length
		|| !!this._addedTeamIDs?.length;
	}

	ngOnInit() {
		this._initData(
			this._activatedRoute
			.snapshot
			.paramMap
			.get( 'id' )
		);
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._navigationBarService
		.contentTmp$
		.next( undefined );
	}

	/**
	 * @return {void}
	 */
	public renameBase() {
		if ( this.baseNameFormControl.invalid ) return;

		if ( !this.newBaseName
			|| this.base.name
			=== this.newBaseName
		) {
			this.newBaseName = '';
			return;
		};

		const baseBk: IBase = _.cloneDeep( this.base );

		this.base.name = this.newBaseName;

		this._baseService
		.update(
			this.base.id,
			{ name: this.base.name }
		)
		.pipe(
			finalize( () => {
				this.newBaseName = '';

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _base: IBase ) => _.assign( this.base, _base ),
			error: () => this.base.name = baseBk.name,
		});
	}

	/**
	 * @return {void}
	 */
	public deleteBase() {
		this._cubConfirmService
		.open(
			'BASE.MESSAGE.WILL_LOST',
			'BASE.MESSAGE.DELETE_BASE',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.LABEL.CANCEL',
				translate: {
					name: this.base.name,
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this._redirectToBaseList();

				this._baseService
				.delete([ this.base.id ])
				.pipe( take( 1 ) )
				.subscribe();
			},
		});
	}

	/**
	 * @return {void}
	 */
	public openSharePopup() {
		this._addedUserIDs = [];
		this._addedTeamIDs = [];

		this._initRole();
		this._initMemberSelected();
		this._initAvailableBaseMembers();
	}

	/**
	 * @return {void}
	 */
	public closeSharePopup() {
		this.isSubmitting = false;
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	public addedUsers( users: CUBTMember[] ) {
		this._addedUserIDs.push( users[ 0 ].id );
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	public removedUsers( users: CUBTMember[] ) {
		this._addedUserIDs
			= _.remove(
				this._addedUserIDs,
				( id: string ) => users[ 0 ].id !== id
			);
	}

	/**
	 * @param {CUBTMember} teams
	 * @return {void}
	 */
	public addedTeams( teams: CUBTMember[] ) {
		this._addedTeamIDs.push( teams[ 0 ].id );
	}

	/**
	 * @param {CUBTMember} teams
	 * @return {void}
	 */
	public removedTeams( teams: CUBTMember[] ) {
		this._addedTeamIDs
			= _.remove(
				this._addedTeamIDs,
				( id: string ) => teams[ 0 ].id !== id
			);
	}

	/**
	 * @return {void}
	 */
	public invite() {
		if ( _.isStrictEmpty( this._addedUserIDs )
			&& _.isStrictEmpty( this._addedTeamIDs ) ) {
			this.popupComponent.close();

			return;
		};

		this._baseRoleService
		.invite( this.roleIDSelected, this._addedUserIDs, this._addedTeamIDs )
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this.base.userIDs.push( ...this._addedUserIDs );
				this.base.teamIDs.push( ...this._addedTeamIDs );

				this._initMemberSelected();
				this.popupComponent.close();
			},
		});
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} members
	 * @return {void}
	 */
	public remove( members: CUBMemberData<CUBTMember[]> ) {
		const bkAvailableSelectedUserIDs: ULID[]
			= _.cloneDeep( this.availableSelectedUserIDs );
		const bkAvailableSelectedTeamIDs: ULID[]
			= _.cloneDeep( this.availableSelectedTeamIDs );
		const removedUserIDs: ULID[]
			= _.map( members.users, 'id' ) || [];
		const removedTeamIDs: ULID[]
			= _.map( members.teams, 'id' ) || [];

		this.availableSelectedUserIDs
			= _.difference( this.availableSelectedUserIDs, removedUserIDs );
		this.availableSelectedTeamIDs
			= _.difference( this.availableSelectedTeamIDs, removedTeamIDs );

		this._baseService
		.removeMembers(
			this.base.id,
			removedUserIDs,
			removedTeamIDs
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._toastService
				.success(
					'BASE.MESSAGE.REMOVE_USER_FROM_BASE_SUCCESS'
				);

				_.remove(
					this.base.userIDs,
					( userID: ULID ) => _.includes( removedUserIDs, userID )
				);
				_.remove(
					this.base.teamIDs,
					( teamID: ULID ) => _.includes( removedTeamIDs, teamID )
				);

				if (
					removedUserIDs.indexOf(
						this._userService.storedUser.user.id
					) >= 0
				) {
					this._redirectToBaseList();
					return;
				}

				this._initAvailableBaseMembers();
			},
			error: () => {
				this.availableSelectedUserIDs
					= _.cloneDeep( bkAvailableSelectedUserIDs );
				this.availableSelectedTeamIDs
					= _.cloneDeep( bkAvailableSelectedTeamIDs );
			},
		});
	}

	/**
	 * @param {ULID} baseID
	 * @return {void}
	 */
	private _initData( baseID: ULID ) {
		this._baseService
		.getDetail( baseID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( base: IBase ) => {
				this.base = base;

				this._notificationService.storedBaseID
					= this.base.id;

				this.baseExpandService.setBase( this.base );
				this._navigationBarService.contentTmp$.next(
					this.contentTmpRef
				);
				this._cdRef.markForCheck();
			},
			error: (
				err: IError
			) => {
				if ( err.error.message !== 'role notfound!' ) return;

				this._toastService
				.info(
					'BASE.MESSAGE.BASE_NOT_AVAILABLE'
				);

				this._redirectToBaseList();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initMemberSelected() {
		this.availableSelectedUserIDs = this.base.userIDs;
		this.availableSelectedTeamIDs = this.base.teamIDs;

		forkJoin([
			this._userService.getAvailableUser(),
			this._teamService.getAvailableTeams(),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( [ users, teams ]: [ IUser[], ITeam[] ] ) => {
			this.selectedUsers = _.filter( users, ( user: IUser ) => {
				if ( user.id === this.base.createdBy ) {
					( user as CUBTMember ).cannotRemove = true;
					( user as CUBTMember ).role = { name: this._translateService.instant( 'BASE.LABEL.OWNER' ) };
				}

				return _.includes( this.base.userIDs, user.id );
			} );
			this.selectedTeams
				= _.filter(
					teams,
					( team: ITeam ) => _.includes( this.base.teamIDs, team.id )
				);

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	private _initAvailableBaseMembers() {
		forkJoin([
			this._baseService.getAvailableUser( this.base.id ),
			this._baseService.getAvailableTeam( this.base.id ),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( [ users, teams ]: [ IUser[], ITeam[] ] ) => {
			this.users = users;
			this.teams = teams;

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	private _initRole() {
		this._roleService
		.get( this.base.id )
		.pipe(
			finalize( () => {
				this.loadedRole = true;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( roles: IRole[] ) => {
				const rolesDefaultLk: Record<IRole[ 'id' ], IRole>
					= _.keyBy( this._roleService.getDefaultRoles(), 'uniqName' );

				_.forEach( roles, ( role: IRole ) => {
					if ( rolesDefaultLk[ role.uniqName ] ) {
						role.description
							||= rolesDefaultLk[ role.uniqName ].description;
						role.name = rolesDefaultLk[ role.uniqName ].name;
					}
				} );

				this.roleIDSelected
					= _.find(
						roles,
						{
							// eslint-disable-next-line max-len
							uniqName: ROLE_PERMISSION_CONSTANT.ROLE_UNIQ_NAME.VIEWER,
						}
					).id;
				this.roles
					= _.filter(
						roles,
						( role: IRole ) => role.uniqName !== null
					);
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _redirectToBaseList() {
		this
		._router
		.navigate(
			[ '../..' ],
			{ relativeTo: this._activatedRoute }
		);
	}

}
