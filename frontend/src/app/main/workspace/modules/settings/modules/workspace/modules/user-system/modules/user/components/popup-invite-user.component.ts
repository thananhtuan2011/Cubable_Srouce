import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	OnInit,
	inject,
	Inject,
	Optional,
	ViewChild
} from '@angular/core';
import {
	Validators,
	FormBuilder,
	FormGroup
} from '@angular/forms';
import {
	Observable,
	forkJoin
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
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
	CUBPopupRef,
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF
} from '@cub/material/popup';

import {
	IRole
} from '../../dispensation/interfaces';
import {
	RoleService
} from '../../dispensation/services';
import {
	CONSTANT as DISPENSATION_CONSTANT
} from '../../dispensation/resources';
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
	CONSTANT
} from '../resources';
import {
	IInviteExpiration,
	IInviteUserData,
	IUserTable
} from '../interfaces';

@Unsubscriber()
@Component({
	selector: 'popup-invite-user',
	templateUrl: '../templates/popup-invite-user.pug',
	styleUrls: [ '../styles/popup-invite-user.scss' ],
	host: { class: 'popup-invite' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupInviteUserComponent
implements OnInit {

	@ViewChild( CUBMultipleEmailInputComponent )
	public multipleEmailInputCmp: CUBMultipleEmailInputComponent;

	protected roles: IRole[];
	protected teams: ITeam[];
	protected rolesDefaultLk: ReadonlyMap<string, Pick<IRole, 'name' | 'uniqName'>>;
	protected inviteForm: FormGroup;
	protected emailsValidation: string[] = [];
	protected newUser: IInviteUserData = {
		expiration: CONSTANT.INVITE_EXPIRATION_VALUE?.NEVER,
	} as IInviteUserData;

	protected readonly INVITE_EXPIRATION: IInviteExpiration[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: { emails: string[] }
	) {
		this.rolesDefaultLk = this._roleService.rolesDefault;
		this.inviteForm = this._fb.group({
			roleID: [
				undefined,
				[ Validators.required ],
			],
			teamIDs: undefined,
			expiration: undefined,
		});
		this.emailsValidation = this.popupContext?.emails;
		this.INVITE_EXPIRATION = this._userService.getInviteExpiration();
	}

	ngOnInit() {
		this._initData();
	}

	/**
	 * @return {void}
	 */
	protected invite() {
		this.multipleEmailInputCmp.onSave(true);

		if(
			!this.multipleEmailInputCmp?.emails.length
			|| this.inviteForm.invalid
		) return;

		this.newUser.emails
			= this.multipleEmailInputCmp.emails;

		this
		._userService
		.bulkInvite( this.newUser )
		.pipe(
			finalize(
				() => {
					this._cdRef.markForCheck();
					this.popupRef.close();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe(
			{
				next: () => {
					this._userService.userChange$.next();
					this.popupRef.close();
					this._showToastSuccess();
				},
			}
		);
	};

	/**
	 * @return {void}
	 */
	private _showToastSuccess() {
		this
		._toastService
		.success(
			'SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.INVITE_SUCCESS',
			{
				duration: 3000,
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		const observables: Observable<any>[] = [
			this._roleService.getResource(),
			this._teamService.getTeams(),
		];

		if(
			!this.emailsValidation
		) {
			observables.push( this._userService.getUserResource() );
		}

		forkJoin( observables )
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: (
				[ roles, teams, users ]: [ IRole[], ITeam[], IUserTable[] ]
			) => {
				if (
					users?.length
				) {
					this._initUsers( users );
				}

				this._initRoles( roles );

				this.teams = teams;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {IUserTable[]} users
	 * @return {void}
	 */
	private _initUsers(
		users: IUserTable[]
	) {
		this.emailsValidation = _.map( users, 'email' );
	}

	/**
	 * @param {IRole[]} roles
	 * @return {void}
	 */
	private _initRoles(
		roles: IRole[]
	) {
		const newRoles: IRole[] = [];

		_.forEach(
			roles,
			( role: IRole ) => {
				if (
					this.rolesDefaultLk.has( role.uniqName )
				) {
					newRoles.push( role );
				}

				if (
					role.uniqName
						=== DISPENSATION_CONSTANT.ROLE_UNIQ_NAME.MEMBER
				) {
					this.newUser.roleID = role.id;
				}
			}
		);

		this.roles = newRoles;
	}

}
