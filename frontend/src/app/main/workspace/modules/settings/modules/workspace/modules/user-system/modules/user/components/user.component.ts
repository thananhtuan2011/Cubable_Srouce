
import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	OnInit,
	inject,
	ViewChild
} from '@angular/core';
import {
	forkJoin
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBToastService
} from '@cub/material/toast';
import {
	CUBMultipleEmailInputComponent
} from '@cub/material/multiple-email-input';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBPopupService
} from '@cub/material/popup';

import {
	AccountService
} from '@main/account/services';
import {
	IAccount
} from '@main/account/interfaces';
import {
	Dimension
} from '@main/common/spreadsheet/components/sub-classes/base';

import {
	IRoleExtra
} from '../../dispensation/interfaces';
import {
	RoleService
} from '../../dispensation/services';
import {
	TeamService
} from '../../team/services';
import {
	ITeam
} from '../../team/interfaces';

import {
	UserService
} from '../services';
import {
	IUserExtra
} from '../interfaces';
import {
	STATUS_USER,
	StatusUser
} from '../resources';

import {
	PopupInviteUserComponent
} from './popup-invite-user.component';
import {
	PopupResendInvitationComponent
} from './popup-resend-invitation.component';

@Unsubscriber()
@Component({
	selector		: 'user',
	templateUrl		: '../templates/user.pug',
	styleUrls		: [ '../styles/user.scss' ],
	host			: { class: 'user' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {

	@ViewChild( CUBMultipleEmailInputComponent )
	public multipleEmailInputCmp: CUBMultipleEmailInputComponent;

	protected roles: IRoleExtra[];
	protected users: IUserExtra[];
	protected selectedRows: IUserExtra[];
	protected teams: ITeam[];
	protected account: IAccount;

	//? Flag
	protected isLoaded: boolean;
	protected isHeaderHover: boolean;
	protected isHeaderChecked: boolean;
	protected isHeaderReadOnly: boolean;
	protected readonly USER_STATUS: typeof StatusUser = StatusUser;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _accountService: AccountService
		= inject( AccountService );

	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _popupService: CUBPopupService
		= inject(	CUBPopupService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );

	get actionBoxOffset(): number {
		return ( Dimension.FooterHeight ) + 16;
	}

	ngOnInit() {
		this.account
			= this._accountService.storedAccount;

		this._getUsers();
		this._fetchData();

		this
		._userService
		.userChange$
		.subscribe(() => {
			this._getUsers();
		});
	};

	// ************************************************************
	// HANDLE EVENT
	// ************************************************************

	/**
	 * @return {void}
	 */
	private _checkHeaderReadOnly(){
		const allOwners: boolean
			= _.every(this.users,
				(u: IUserExtra) => (u.isOwner || u.isAccount)
			);

		this.isHeaderReadOnly
			= allOwners;
	}

	/**
	 * @param {boolean} e
	 * @param {number} i
	 * @return {void}
	 */
	protected onRowSelected( e: boolean, i: number ) {
		this.users[i].isSelected = e;
		this._updateCheckBoxAll();
		this.getSelectedRows();
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected onHeaderSelected( e: boolean ) {
		this.isHeaderChecked = e;

		_.forEach( this.users, ( u: IUserExtra ) => {
			if( u.isOwner || u.isAccount ){
				u.isSelected = false;
			}else{
				u.isSelected = e;
			}
		});

		this.getSelectedRows();
	}

	/**
	 * @return {void}
	 */
	private _updateCheckBoxAll() {
		this.isHeaderChecked
			= _.every( this.users,
				(u: IUserExtra) => u.isSelected
			);
	}

	/**
	 * @return {void}
	 */
	protected getSelectedRows() {
		this.selectedRows
			= _.filter(this.users,
				(u: IUserExtra) => u.isSelected
			);
	}

	// ************************************************************
	// HANDLE ACTION BOX
	// ************************************************************

	/**
	 * @return {void}
	 */
	protected onDeselectAllRows(){
		this.selectedRows = [];
		this.isHeaderChecked = false;
		_.map(this.users,
			( u: IUserExtra ) => u.isSelected = false
		);
	}

	/**
	 * @param {string} email
	 * @return {void}
	 */
	protected onActiveUser( email: string ) {
		this.users
			= _.map( this.users,
				( user: IUserExtra ) => {
					if ( user.email === email ) {
						user.status = StatusUser.Active;
					}

					user.infoStatus
						= STATUS_USER.get( user.status );
					return user;
				}
			);

		this._cdRef.markForCheck();
		this._activeUsers([ email ]);

	}

	/**
	 * @return {void}
	 */
	protected onActivateUsers() {
		const emails: string[] = [];

		_.map( this.selectedRows,
			( user: IUserExtra ) => {
				if( user.status === StatusUser.Inactive ){
					emails.push( user.email );
				}
			}
		);

		if( emails.length === 0 ) {
			this._cdRef.markForCheck();
			this.onDeselectAllRows();
			return;
		};

		this.users
			= _.map( this.users,
				( user: IUserExtra ) => {
					if ( _.includes( emails, user.email ) ) {
						user.status = StatusUser.Active;
					}

					user.infoStatus
						= STATUS_USER.get( user.status );
					return user;
				}
			);

		this._cdRef.markForCheck();
		this.onDeselectAllRows();
		this._activeUsers( emails );
	}

	/**
	 * @param {string} email
	 * @return {void}
	 */
	protected onDeActiveUser( email: string ) {
		this
		._confirmDeActiveUser()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.users
					= _.map( this.users,
						( user: IUserExtra ) => {
							if ( user.email === email ) {
								user.status = StatusUser.Inactive;
							}

							user.infoStatus
								= STATUS_USER.get( user.status );
							return user;
						}
					);

				this._cdRef.markForCheck();
				this._deActiveUsers([ email ]);
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onDeActivateUsers() {
		const emails: string[] = [];

		_.map( this.selectedRows,
			( user: IUserExtra ) => {
				if( user.status === StatusUser.Active ){
					emails.push( user.email );
				}
			}
		);

		if( emails.length === 0 ) {
			this._cdRef.markForCheck();
			this.onDeselectAllRows();
			return;
		};

		this
		._confirmDeActiveUser()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.users
					= _.map(this.users,
						(user: IUserExtra) => {
							if (_.includes(emails, user.email)) {
								user.status = StatusUser.Inactive;
							}
							user.infoStatus
								= STATUS_USER.get(user.status);
							return user;
						}
					);

				this._cdRef.markForCheck();
				this.onDeselectAllRows();
				this._deActiveUsers( emails );
			},
		});
	}

	/**
	 * @param {string} email
	 * @return {void}
	 */
	protected onDeleteUser( email: string ) {
		this
		._confirmDeleteUser(
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.CONFIRM_DELETE_USER',
			email
		)
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.users
					= _.filter( this.users,
						( user: IUserExtra ) => user.email !== email
					);

				this._cdRef.markForCheck();
				this._deleteUser([ email ]);
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onDeleteUsers() {
		const emails: string[]
			= _.map( this.selectedRows,
				( user: IUserExtra ) => user.email
			);

		this._confirmDeleteUser(
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.CONFIRM_DELETE_USERS'
		)
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.users
					= _.filter( this.users,
						( user: IUserExtra ) =>
							!_.includes( emails, user.email )
					);

				this._cdRef.markForCheck();
				this.onDeselectAllRows();;
				this._deleteUser( emails );
			},
		});

	};

	// ************************************************************
	// HANDLE API
	// ************************************************************

	/**
	 * @return {void}
	 */
	private _fetchData() {
		this.isLoaded = false;

		forkJoin([
			this._teamService.getAvailableTeams(),
			this._roleService.getResource(),
		])
		.pipe(
			finalize( () => {
				this.isLoaded = true;
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			[ teams, roles ]: [ ITeam[], IRoleExtra[] ]
		) => {
			this.roles = roles;
			this.teams = teams;

			this._formatData(
				this.teams,
				this.roles
			);

			this._checkHeaderReadOnly();
			this._cdRef.markForCheck();

		});
	}

	/**
	 * @return {void}
	 */
	private _getUsers() {
		this
		._userService
		.getUserResource()
		.pipe(
			finalize( () => {
				this.isLoaded = true;
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		).subscribe(
			( users: IUserExtra[] ) => {
				this.users = users;

				if( !this.teams && !this.roles ) {
					this._fetchData();
				} else {
					this._formatData(
						this.teams , this.roles
					);
				}

				this._checkHeaderReadOnly();
				this._cdRef.markForCheck();

			}
		);
	}

	/**
	 * @param {string[]} emails
	 * @return {void}
	 */
	private _deleteUser(
		emails: string[]
	) {
		this
		._userService
		.bulkDelete( emails )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._showToastSuccess(
						'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.DELETE_SUCCESS'
					);
				},
			}
		);
	}

	/**
	 * @param {string[]} emails
	 * @return {void}
	 */
	private _activeUsers(
		emails: string[]
	) {
		this
		._userService
		.activate( emails )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._showToastSuccess(
						'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.ACTIVE_SUCCESS'
					);
				},
			}
		);
	}

	/**
	 * @param {string[]} emails
	 * @return {void}
	 */
	private _deActiveUsers(
		emails: string[]
	) {
		this
		._userService
		.deactivate( emails )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._showToastSuccess(
						'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.INACTIVE_SUCCESS'
					);
				},
			}
		);
	}

	/**
	 * @param { ITeam[]} teams
	 * @param {IRoleExtra[]}roles
	 * @return {IUserTable[]}
	 */
	private _formatData(
		teams: ITeam[],
		roles: IRoleExtra[]
	 ) {
		_.map(this.users,
			( user: IUserExtra )=> {
				user.roles = [];
				_.forEach(
					user.roleIDs,
					( id: ULID ) => {
						const currentRole: IRoleExtra
							= _.find(
								roles,
								( role: IRoleExtra ) => id === role.id
							);
						if ( currentRole ) {
							if (
								currentRole.uniqName === 'admin'
							) {
								user.isAdmin = true;
							}

							user.roles.push( currentRole );
						}
					}
				);

				user.teams = [];

				_.forEach(
					user.teamIDs,
					( id: string ) => {
						const currentTeam: ITeam
							= _.find(
								teams,
								( team: ITeam ) => id === team.id
							);

						if ( currentTeam ) {
							user.teams.push( currentTeam );
						}
					}
				);

				user.selectedTeamIDs
					= _.map( teams, 'id' );

				user.createdByUser
					= _.find( this.users, { id: user.createdBy } );

				if (
					user?.email === this.account?.email
				) {
					user.isAccount = true;
				}

				user.tooltipRoles
					= _.map( user.roles, 'name' ).join(', ');
				user.infoStatus
					= STATUS_USER.get( user.status );

			}
		);
	}

	// ************************************************************
	// HANDLE TOAST, DIALOG, POPUP...
	// ************************************************************

	/**
	 * @return {void}
	 */
	protected openPopupResendInviteUser(
		user: IUserExtra
	) {
		this
		._popupService
		.open(
			null,
			PopupResendInvitationComponent,
			{
				email: user.email,
				expiration: user.expiration,
				roleID: user.roleIDs[ 0 ],
				teamIDs: user.teamIDs,
				roles: this.roles,
				teams: this.teams,
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected openPopupInviteUser() {
		this
		._popupService
		.open(
			null,
			PopupInviteUserComponent,
			{
				emails: _.map( this.users, 'email' ),
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);
	}

	/**
	 * @param {string} mess
	 * @return {void}
	 */
	private _showToastSuccess(
		mess: string
	) {
		this
		._toastService
		.success(
			mess,
			{
				duration: 3000,
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _confirmDeleteUser(
		mess: string,
		user?: string
	) {
		return this
		._cubConfirmService
		.open(
			mess,
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.CONFIRM_DELETE',
			{
				warning: true,
				translate: { user },
				buttonApply: {
					text: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.CANCEL',
			}
		)
		.afterClosed();
	}

	/**
	 * @return {void}
	 */
	private _confirmDeActiveUser(){
		return this
		._cubConfirmService
		.open(
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.CONFIRM_DEACTIVATE',
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.CONFIRM_DEACTIVATE',
			{
				buttonApply: {
					text: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.DEACTIVATE',
					type: 'destructive',
				},
				buttonDiscard: 'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.CANCEL',
			}
		)
		.afterClosed();
	}
};
