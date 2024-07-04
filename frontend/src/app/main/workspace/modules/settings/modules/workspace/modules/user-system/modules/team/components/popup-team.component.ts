import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Optional,
	Inject,
	inject,
	ChangeDetectorRef
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	FormGroup,
	FormControl,
	FormBuilder
} from '@angular/forms';
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
	CUBPopupRef,
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF
} from '@cub/material/popup';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBTMember
} from '@cub/material/member-picker';

import {
	RoleService
} from '../../dispensation/services';
import {
	IRole
} from '../../dispensation/interfaces';
import {
	IUser,
	IUserTable
} from '../../user/interfaces';
import {
	StatusUser
} from '../../user/resources';

import {
	TeamService
} from '../services';
import {
	PopupContextTeam,
	ITeam,
	TeamDataUpdate
} from '../interfaces';
import {
	PopMode
} from '../resources';

@Unsubscriber()
@Component({
	selector: 'popup-team',
	templateUrl: '../templates/popup-team.pug',
	styleUrls: [ '../styles/popup-team.scss' ],
	host: { class: 'popup-team' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupTeamComponent implements OnInit {

	protected readonly POPUP_MODE: typeof PopMode = PopMode;
	protected readonly teamNameFormControl: FormControl;

	protected mode: PopMode;
	protected formTeam: FormGroup;
	protected roles: IRole[];
	protected users: IUserTable[];
	protected teams: ITeam[];
	protected rolesDefault: ReadonlyMap<string, Pick<IRole, 'name' | 'uniqName' | 'description'>>;

	protected team: ITeam;

	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _teamService: TeamService
		= inject( TeamService );

	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );

	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: PopupContextTeam
	) {
		this.teamNameFormControl
			= new FormControl(
				undefined,
				[
					EqualValidators.uniqueNameValidator(
						() => _.reject(
							this.teams,
							{ id: this.popupContext.team?.id }
						),
						false,
						'name'
					),
				]
			);
	};

	ngOnInit() {
		this.rolesDefault = this._roleService.rolesDefault;
		this.teams = this.popupContext.teams;
		// TODO check if pending => active => pending
		this.users = this.popupContext.users.filter(
			( u: IUser ) => {
				return u.status === StatusUser.Active
					|| u.status === StatusUser.Inactive;
			}
		);
		this.roles = this.popupContext.roles;
		this.mode = this.popupContext.mode;
		this.team = this.popupContext.team
			|| {
				name: generateUniqueName(
					_.map( this.teams, 'name' ),
					this._translateService.instant(
						'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.TEAM'
					),
					80,
					( idx: number ): string => ` ${idx}`
				) + ( this.teams?.length ? '' : ` 1` ),
				isActive: true,
			} as ITeam;

		this.formTeam = this._fb.group({
			userIDs: undefined,
			roleIDs: undefined,
			isActive: undefined,
		});
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	protected addedUsers(
		users: CUBTMember[]
	) {
		if (
			!users
		) return;

		this.team.userIDs = [
			...( this.team.userIDs || [] ),
			..._.map(
				users,
				'id'
			),
		];
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	protected removedUsers(
		users: CUBTMember[]
	) {
		if (
			!users
		) return;

		this.team.userIDs
			= _.difference(
				this.team.userIDs,
				_.map(
					users,
					'id'
				)
			);
	}

	/**
	 * @param {boolean} isActive
	 * @return {Promise}
	 */
	protected onBeforeSwitchModeFn(
		isActive: boolean
	): Promise<boolean> {
		return new Promise(
			( resolve: any ) => {
				if ( isActive ) {
					this._cubConfirmService
					.open(
						'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.MESSAGE.CONFIRM_DEACTIVATE_TEAM',
						'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.DEACTIVATE_TEAM',
						{
							warning: true,
							buttonApply: {
								text: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.STATUS_INACTIVE',
								type: 'destructive',
							},
							buttonDiscard: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.CANCEL',
						}
					)
					.afterClosed()
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							resolve( true );
						},
					});
				} else {
					resolve( true );
				}
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected onSubmit() {
		const data: TeamDataUpdate = {
			name: this.team.name.trim(),
			isActive: this.team.isActive,
			userIDs: this.team.userIDs || [],
			roleIDs: this.team.roleIDs || [],
		};

		if (
			this.formTeam.invalid
		) return;

		if (
			this.mode === PopMode.Edit
		) {
			this._editTeam( data );
		} else {
			this._createTeam( data );
		}
	}

	/**
	 * @param {TeamDataUpdate} data
	 * @return {void}
	 */
	private _createTeam(
		data: TeamDataUpdate
	) {
		this._teamService
		.create( data )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
				this.popupRef.close();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._teamService.teamChange$.next();
				},
			}
		);
	}

	/**
	 * @param {TeamDataUpdate} data
	 * @return {void}
	 */
	private _editTeam(
		data: TeamDataUpdate
	) {
		this._teamService
		.edit(
			this.team.id,
			data
		)
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
				this.popupRef.close();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._teamService.teamChange$.next();
				},
			}
		);
	}

}
