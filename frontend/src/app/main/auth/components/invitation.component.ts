import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Injector,
	OnInit
} from '@angular/core';
import {
	ActivatedRoute,
	Params
} from '@angular/router';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	IError
} from '@error/interfaces';
import {
	CONSTANT as ERROR_CONSTANT
} from '@error/resources';

import {
	IAccount
} from '@main/account/interfaces';
import {
	AccountService
} from '@main/account/services';
import {
	IWorkspace,
	IWorkspaceAccessBase
} from '@main/workspace/interfaces';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';

import {
	IAcceptInvitation,
	IInspectInvitation
} from '../interfaces';
import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

import {
	AuthBase
} from './auth-base';

export type IAcceptInvitationType
	= MapObjectValue<typeof InvitationComponent.ACCEPT_INVITATION_TYPE>;

enum InvitationStep {
	ACCEPT = 1,
	SIGNIN,
	SIGNUP,
	EXPIRED,
	LIMITATION,
	DELETED,
	REJECTED,
	INVALID
}

interface _IAcceptInvitationType {
	signin: number;
	signup: number;
}

@Unsubscriber()
@Component({
	selector		: 'invitation',
	templateUrl		: '../templates/invitation.pug',
	styleUrls		: [ '../styles/auth.scss' ],
	host			: { class: 'auth invitation' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class InvitationComponent
	extends AuthBase<MapObjectValue<typeof InvitationStep>>
	implements OnInit {

	public static readonly ACCEPT_INVITATION_TYPE: _IAcceptInvitationType
		= {
			signin: 1,
			signup: 2,
		};

	protected readonly INVITATION_STEP: typeof InvitationStep
		= InvitationStep;
	protected readonly PATH: typeof CONSTANT.PATH
		= CONSTANT.PATH;

	protected isEmailPasswordIncorrect: boolean;
	protected isInitiatingData: boolean;
	protected isDirectAcceptWorkspace: boolean;
	protected isSubmitting: boolean;
	protected isAuthorized: boolean;
	protected account: Partial<IAccount> = {};
	protected workspace: IWorkspace;

	private _token: string;

	constructor(
		protected injector: Injector,
		private _cdRef: ChangeDetectorRef,
		private _activatedRoute: ActivatedRoute,
		private _authService: AuthService,
		private _accountService: AccountService
	) {
		super( injector );
	};

	ngOnInit() {
		const queryParams: Params
			= this._activatedRoute.snapshot.queryParams;

		this._token
			= queryParams.token;

		if ( !this._token ) {
			this.stateNavigate([ CONSTANT.PATH.SIGN_IN ]);
			return;
		}

		if (
			queryParams.isDirectAccept
		) {

			this.directAcceptWorkspace();
			return;

		} else if (
			queryParams.isReject
		) {

			this.rejectWorkspace();
			return;

		} else if (
			queryParams.workspaceID
		) {

			this.account
				= {
					email: queryParams.email,
					password: queryParams.password,
					name: queryParams.name,
				};

			this.acceptInvitation();
			return;

		}

		this._inspectInvitation();
	}

	/**
	 * @return {void}
	 */
	protected acceptInvitation() {
		this._authService
		.acceptInvitation(
			this._token,
			this.account as IAccount
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IAcceptInvitation ) => {
				if ( !result ) return;

				this.step = InvitationStep.ACCEPT;
				this.workspace
					= result.workspace;

				if ( result.account ){
					this.account
						= result.account;
				}
			},
			error: ( error: IError ) => {
				this._setErrorStep( error.error.key );
			},
		});
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @return {void}
	 */
	protected directAcceptWorkspace() {
		this._authService
		.directAcceptInvitation( this._token )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( result: IWorkspaceAccessBase ) => {
				if ( !result ) return;
				this.workspace
					= result.workspace;

				this.accessWorkspace();
			},
			error: ( error: IError ) => {
				this._setErrorStep( error.error.key );
			},
		});
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @return {void}
	 */
	protected rejectWorkspace() {
		this._authService
		.rejectInvitation( this._token )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.stateNavigate([ CONSTANT.PATH.SIGN_IN ]);
			},
			error: ( error: IError ) => {
				this._setErrorStep( error.error.key );
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected accessWorkspace() {
		this.stateNavigate([
			WORKSPACE_CONSTANT.PATH.MAIN,
			this.workspace.id,
		]);
	}

	/**
	 * @param {string} key
	 * @return {void}
	 */
	private _setErrorStep( key: string ) {
		switch( key ) {
			case ERROR_CONSTANT.KEY
			.REACH_LIMITATION_MEMBERS:
				this.step
					= InvitationStep.LIMITATION;
				break;

			case ERROR_CONSTANT.KEY
			.EXPIRED_INVITATION:
				this.step
					= InvitationStep.EXPIRED;
				break;

			case ERROR_CONSTANT.KEY
			.DELETED_INVITATION:
				this.step
					= InvitationStep.DELETED;
				break;

			case ERROR_CONSTANT.KEY
			.REJECTED_INVITATION:
				this.step
					= InvitationStep.REJECTED;
				break;
			default:
				this.step
					= InvitationStep.INVALID;
		}
	}
	/**
	 * @return {void}
	 */
	private _inspectInvitation() {
		this.isInitiatingData = true;

		this._authService
		.inspectInvitation( this._token )
		.pipe(
			finalize( () => {
				this.isInitiatingData
					= false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IInspectInvitation ) => {
				if ( !result ) {
					this.step
						= InvitationStep.EXPIRED;

					this._cdRef.markForCheck();
					return;
				}

				this.workspace
					= result.workspace;
				this.account =
					_.omit(
						result.account,
						'password'
					);

				if ( result.isNewAccount ) {
					this.step
						= InvitationStep.SIGNUP;

					super.stateNavigate(
						[ CONSTANT.PATH.SIGNUP ],
						{
							email: result.account.email,
							workspaceID: result.workspace.id,
							token: this._token,
						}
					);
					this._cdRef.markForCheck();
					return;
				}

				this.isAuthorized
					= this._authService.isAccountAccessed
						&& this._accountService.storedAccount?.email
							=== this.account.email;

				if ( this.isAuthorized ) {
					this.step
						= InvitationStep.ACCEPT;
					this.isDirectAcceptWorkspace
						= true;

					this._authService
					.directAcceptInvitation( this._token )
					.pipe(
						finalize( () => {
							this.isDirectAcceptWorkspace
								= false;

							this._cdRef.markForCheck();
						} ),
						untilCmpDestroyed( this )
					)
					.subscribe({
						next: ( resultDirect: IWorkspaceAccessBase ) => {
							this.workspace
								= resultDirect.workspace;
						},
						error: ( error: IError ) => {
							this._setErrorStep( error.error.key );
						},
					});
				} else {
					this._authService
					.signout()
					.pipe( untilCmpDestroyed( this ) )
					.subscribe({
						next: () => {
							this.step
								= InvitationStep.SIGNIN;

							super.stateNavigate(
								[ CONSTANT.PATH.SIGN_IN ],
								{
									email: result.account.email,
									workspaceID: result.workspace.id,
									acceptToken: this._token,
								}
							);
						},
					});
				}

				this._cdRef.markForCheck();
			},
			error: ( error: IError ) => {
				this._setErrorStep( error.error.key );
			},
		});
	}
}
