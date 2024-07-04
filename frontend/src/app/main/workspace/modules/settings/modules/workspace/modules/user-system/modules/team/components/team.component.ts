import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	ChangeDetectorRef
} from '@angular/core';
import {
	finalize
} from 'rxjs/operators';
import {
	forkJoin
} from 'rxjs';
import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';
import _ from 'lodash';

import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastService
} from '@cub/material/toast';
import {
	CUBPopupService
} from '@cub/material/popup';

import {
	UserService
} from '../../user/services';
import {
	RoleService
} from '../../dispensation/services';
import {
	IUserTable
} from '../../user/interfaces';
import {
	IRole
} from '../../dispensation/interfaces';

import {
	TeamService
} from '../services';
import {
	PopupContextTeam,
	ITeamExtra
} from '../interfaces';
import {
	PopMode,
	STATUS_TEAM
} from '../resources';

import {
	PopupTeamComponent
} from './popup-team.component';

@Unsubscriber()
@Component({
	selector: 'team',
	templateUrl: '../templates/team.pug',
	styleUrls: [ '../styles/team.scss' ],
	host: { class: 'team' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent implements OnInit {

	protected roles: IRole[];
	protected users: IUserTable[];
	protected teams: ITeamExtra[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _roleService: RoleService
		= inject( RoleService );

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );

	ngOnInit(){
		this._getTeams();
		this
		._teamService
		.teamChange$
		.subscribe( () => this._getTeams() );
	}

	/**
	 * @param {ITeamExtra} team
	 * @return {void}
	 */
	protected onDeleteTeam( team: ITeamExtra ) {
		this._confirmDeleteUser( team.name )
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.teams = _.filter(
					this.teams,
					( t: ITeamExtra ) => t.id !== team.id
				);

				this._deleteTeam( team.id );
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {ITeamExtra} team
	 * @return {void}
	 */
	protected onEditTem( team: ITeamExtra ) {
		this._popupService.open(
			null,
			PopupTeamComponent,
			{
				team,
				mode: PopMode.Edit,
				teams: this.teams,
				users: this.users,
				roles: this.roles,
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
	private _getTeams() {
		this._teamService
		.getTeams()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( teams: ITeamExtra[] ) => {
				this.teams = teams;

				this._fetchData();
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _fetchData() {
		forkJoin([
			this._userService.getUserResource(),
			this._roleService.getResource(),
		])
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			[ users, roles ]: [ IUserTable[], IRole[] ]
		) => {
			this.users = users;
			this.roles = roles;

			this._formatData( users, roles);
			this._cdRef.markForCheck();

		});
	}

	/**
	 * @param {IUserTable[]} users
	 * @param {IRole[]} roles
	 * @return {void}
	 */
	private _formatData(
		users: IUserTable[],
		roles: IRole[]
	) {
		this.teams.map(
			(team: ITeamExtra) => {
				team.infoStatus
					= STATUS_TEAM.get( team.isActive );

				team.createdByUser
					= _.find(
						users,
						{ id: team.createdBy }
					);

				team.users
					= _.compact(
						_.map(
							team.userIDs,
							( id: string ) => _.find( users, { id } )
						)
					);

				team.roles
					= _.compact(
						_.map(
							team.roleIDs,
							( id: string ) => _.find( roles, { id } )
						)
					);

				team.tooltipRoles
					= _.map( team.roles, 'name' ).join(', ');
			}
		);

	}

	/**
	 * @param {string} id
	 * @return {void}
	 */
	private _deleteTeam( id: string ) {
		this._teamService
		.delete( id )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._showToastSuccess();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected openPopupCreateTeam() {
		this._popupService.open(
			null,
			PopupTeamComponent,
			{
				mode: PopMode.New,
				teams: this.teams,
				roles: this.roles,
				users: this.users,
			} as PopupContextTeam,
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);
	}

	/**
	 * @param {string} team
	 * @return {void}
	 */
	private _confirmDeleteUser( team: string ){
		return this._cubConfirmService
		.open(
			'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.MESSAGE.CONFIRM_DELETE_TEAM',
			'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.DELETE_TEAM',
			{
				warning: true,
				translate: { team },
				buttonApply: {
					text: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.CANCEL',
			}
		)
		.afterClosed();
	}

	/**
	 * @return {void}
	 */
	private _showToastSuccess(){
		this._toastService
		.success(
			'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.MESSAGE.DELETE_SUCCESS',
			{
				duration: 3000,
			}
		);
	}

};
