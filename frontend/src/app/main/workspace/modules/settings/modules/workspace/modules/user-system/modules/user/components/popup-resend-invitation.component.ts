import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Inject,
	Optional
} from '@angular/core';
import {
	FormBuilder,
	FormGroup
} from '@angular/forms';
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
	CUBPopupRef,
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF
} from '@cub/material/popup';
import {
	CUBTMember
} from '@cub/material/member-picker';

import {
	IRole
} from '../../dispensation/interfaces';
import {
	RoleService
} from '../../dispensation/services';
import {
	ITeam
} from '../../team/interfaces';

import {
	UserService
} from '../services';
import {
	IInviteExpiration,
	IPopupResendInviteUserData,
	IResendInviteUserData
} from '../interfaces';

@Unsubscriber()
@Component({
	selector: 'popup-resend-invitation',
	templateUrl: '../templates/popup-resend-invitation.pug',
	styleUrls: [ '../styles/popup-resend-invitation.scss' ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupResendInvitationComponent {

	protected readonly INVITE_EXPIRATION: IInviteExpiration[];

	protected roles: IRole[];
	protected teams: ITeam[];
	protected rolesDefaultLk: ReadonlyMap<string, Pick<IRole, 'name' | 'uniqName'>>;
	protected isSubmitting: boolean;
	protected resendInviteForm: FormGroup;
	protected userUpdating: IResendInviteUserData = {
		expiration: 0,
		teamIDs: [],
		roleID: '',
		email: '',
	};

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	get isChanged(): boolean {
		return !_.isEqual(
			this.userUpdating.expiration,
			this.popupContext.expiration
		)
		|| !_.isEqual(
			this.userUpdating.roleID,
			this.popupContext.roleID
		)
		|| !_.isEqual(
			this.userUpdating.teamIDs,
			this.popupContext.teamIDs
		);
	}

	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: IPopupResendInviteUserData
	) {
		this.rolesDefaultLk
			= this._roleService.rolesDefault;
		this.resendInviteForm
			= this._fb.group({
				email: undefined,
				roleID: undefined,
				expiration: undefined,
			});
		this.userUpdating.roleID
			= this.popupContext.roleID;
		this.userUpdating.expiration
			= this.popupContext.expiration;
		this.userUpdating.email
			= this.popupContext.email;
		this.userUpdating.teamIDs
			= this.popupContext.teamIDs;
		this.roles
			= this.popupContext.roles;
		this.teams
			= this.popupContext.teams;

		this.INVITE_EXPIRATION
			= this._userService.getInviteExpiration();

		this.setRoles();
	}

	/**
	 * @return {void}
	 */
	public resendInvite() {
		this.isSubmitting = true;

		const dataUpdate: IResendInviteUserData
			= {
				email: this.userUpdating.email,
			};

		if (
			!_.isEqual(
				this.userUpdating.expiration,
				this.popupContext.expiration
			)
		) {
			dataUpdate.expiration
				= this.userUpdating.expiration;
		}

		if (
			!_.isEqual(
				this.userUpdating.roleID,
				this.popupContext.roleID
			)
		) {
			dataUpdate.roleID
				= this.userUpdating.roleID;
		}

		if (
			!_.isEqual(
				this.userUpdating.teamIDs,
				this.popupContext.teamIDs
			)
		) {
			dataUpdate.teamIDs
				= this.userUpdating.teamIDs;
		}

		this
		._userService
		.resendInvitation( dataUpdate )
		.pipe(
			finalize(
				() => {
					this.isSubmitting = false;

					this.popupRef.close();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._userService.userChange$.next();
				this._showToastSuccess();
			},
		});
	};

	/**
	 * @return {void}
	 */
	protected setRoles() {
		const newRoles: IRole[] = [];

		_.forEach(
			this.popupContext.roles,
			( role: IRole ) => {
				if (
					this.rolesDefaultLk.has( role.uniqName )
				) {
					newRoles.push( role );
				}
			}
		);

		this.roles = newRoles;
	}

	/**
	 * @param {CUBTMember[]} event
	 * @return {void}
	 */
	protected addTeams(
		event: CUBTMember[]
	) {
		if (
			!event
		) return;

		this.userUpdating.teamIDs = [
			...( this.userUpdating.teamIDs || [] ),
			..._.map(
				event,
				'id'
			),
		];
	}

	/**
	 * @param {CUBTMember[]} event
	 * @return {void}
	 */
	protected removeTeams(
		event: CUBTMember[]
	) {
		if (
			!event
		) return;

		this.userUpdating.teamIDs
			= _.difference(
				this.userUpdating.teamIDs,
				_.map(
					event,
					'id'
				)
			);
	}

	/**
	 * @return {void}
	 */
	private _showToastSuccess() {
		this._toastService
		.success(
			// eslint-disable-next-line max-len
			`SETTINGS.WORKSPACE.USER_SYSTEM.USER.MESSAGE.RESEND_INVITATION_SUCCESS`,
			{
				duration: 3000,
			}
		);
	}

}
