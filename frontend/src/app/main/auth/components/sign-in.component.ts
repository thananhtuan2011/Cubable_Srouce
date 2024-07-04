import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Injector,
	OnInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	Router,
	ActivatedRoute
} from '@angular/router';
import {
	MsalService
} from '@azure/msal-angular';
import {
	AuthenticationResult
} from '@azure/msal-browser';
import {
	of
} from 'rxjs';
import {
	finalize,
	switchMap,
	catchError
} from 'rxjs/operators';
import _ from 'lodash';
import {
	ULID
} from 'ulidx';

import {
	Memoize,
	StorageService,
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
	CUBConfirmService
} from '@cub/material/confirm';
import {
	ACCENT_COLORS
} from '@cub/resources';

import {
	IAccount
} from '@main/account/interfaces';
import {
	CONSTANT as ACCOUNT_CONSTANT
} from '@main/account/resources';
import {
	CONSTANT as SETTINGS_CONSTANT
} from '@main/workspace/modules/settings/resources';
import {
	IWorkspace
} from '@main/workspace/interfaces';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	AccountService
} from '@main/account/services/account.service';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	REGEXP
} from '@resources';

import {
	IAccountAccessSignIn,
	ISocialCredential,
	ISocialProfile,
	ISocialRequest,
	IToken
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

declare const google: any;
declare const gapi: any;

interface ISigninStep {
	signin: number;
	direct: number;
	collect: number;
	workspace: number;
}

interface IWorkspaceExtra extends IWorkspace {
	parsedLabel: string;
	parsedColor: string;
}

@Unsubscriber()
@Component({
	selector		: 'sign-in',
	templateUrl		: '../templates/sign-in.pug',
	styleUrls		: [ '../styles/auth.scss', '../styles/sign-in.scss' ],
	host			: { class: 'sign-in' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent extends AuthBase
	<MapObjectValue<typeof SignInComponent.SIGNIN_STEP>>
	implements OnInit {
	protected static readonly SIGNIN_STEP: ISigninStep =
		{
			signin: 1,
			direct: 2,
			collect: 3,
			workspace: 4,
		};
	protected static readonly TABS: ObjectType<number>
		= {
			JOINED: 0,
			INVITED: 1,
		};

	protected readonly USER_PATH: string
		= `${SETTINGS_CONSTANT.PATH.MAIN}/${SETTINGS_CONSTANT.PATH.USER}`;
	protected readonly SIGNIN_STEP: ISigninStep
		= SignInComponent.SIGNIN_STEP;
	protected readonly TABS: ObjectType<number>
		= SignInComponent.TABS;
	protected readonly PATH: typeof CONSTANT.PATH
		= CONSTANT.PATH;
	protected readonly ACCOUNT_SETTINGS_PATH:
		typeof ACCOUNT_CONSTANT.PATH.ACCOUNT_SETTINGS =
			ACCOUNT_CONSTANT.PATH.ACCOUNT_SETTINGS;

	protected loaded: boolean;
	protected isSubmitting: boolean;
	protected hiddenPassword: boolean;
	protected isGoogleSubmitting: boolean;
	protected isMicrosoftSubmitting: boolean ;
	protected isEmailPasswordIncorrect: boolean;
	protected isFromSignUp: boolean;
	protected isAfterCollectInfo: boolean;
	protected existAccount: string;
	protected wrongEmail: string;
	protected acceptToken: string;
	protected selectedIndexWorkspace: number = 0;
	protected countWrongEmailTimes: number = 0;
	protected itemSelectedID: ULID;
	protected itemFadeID: ULID;
	protected invitedWorkspaceID: ULID;
	protected account: Partial<IAccount> = {};
	protected recentWorkspace: IWorkspaceExtra;
	protected signInForm: FormGroup;
	protected credential: ISocialRequest;
	protected socialProfile: ISocialProfile;
	protected workspaces: IWorkspaceExtra[];

	private _auth2: any;

	get auth2(): any { return this._auth2; }
	set auth2( value: any ) {
		if ( value ) {
			this._auth2
				= value;
			this.isGoogleSubmitting
				= true;

			this.auth2.requestAccessToken();
		}
	}

	/**
	 * @constructor
	 * @param {Injector} injector
	 * @param {FormBuilder} _fb
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {ActivatedRoute} _activatedRoute
	 * @param {StorageService} _storageService
	 * @param {AuthService} _authService
	 * @param {WorkspaceService} _workspaceService
	 * @param {MsalService} _msalService
	 * @param {Router} _router
	 * @param {AccountService} _accountService
	 */
	 constructor(
		protected injector: Injector,
		private _fb: FormBuilder,
		private _cdRef: ChangeDetectorRef,
		private _activatedRoute: ActivatedRoute,
		private _storageService: StorageService,
		private _cubConfirmService: CUBConfirmService,
		private _authService: AuthService,
		private _workspaceService: WorkspaceService,
		private _msalService: MsalService,
		private _router: Router,
		private _accountService: AccountService
	) {
		super( injector );

		this.signInForm
			= this._fb.group({
				email: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.pattern( REGEXP.EMAIL ),
					],
				],
				password: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.minLength( 1 ),
					],
				],
			});
	};

	/**
	 * @constructor
	 */
	ngOnInit() {
		super.ngOnInit();

		this.invitedWorkspaceID
			= this._activatedRoute.snapshot.queryParams.workspaceID;
		this.acceptToken
			= this._activatedRoute.snapshot.queryParams.acceptToken;

		this._signInExistAccount();

		setTimeout(
			() => {
				if ( !this._authService.isAccountAccessed ) {
					this.step
						= SignInComponent.SIGNIN_STEP
						.signin;

					this._cdRef.markForCheck();
					return;
				};

				this.isFromSignUp = true;

				this._authService
				.accountInfo()
				.pipe(
					untilCmpDestroyed( this ),
					finalize( () => this._cdRef.markForCheck() )
				)
				.subscribe({
					next: () => {
						this.account
							= this._accountService.storedAccount;

						this._getWorkspaces();

						if ( !this.account ) {
							this.step
								= SignInComponent.SIGNIN_STEP.signin;

							this._cdRef.markForCheck();
							return;
						};

						if ( !this.account.onBoardingFlow ) {
							this.account.onBoardingFlow
								= { isSkipped: false };
						}

						this.step
							= SignInComponent.SIGNIN_STEP.workspace;
					},
					error: () => {
						this.loaded = true;
						this.step = this.SIGNIN_STEP.signin;
					},
				});
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected changeValue() {
		if ( !this.isEmailPasswordIncorrect ) return;

		this.isEmailPasswordIncorrect
			= false;

		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	protected signin() {
		this.isSubmitting
			= true;

		this._authService
		.signin( this.account as IAccount )
		.pipe(
			finalize( () => {
				this.isSubmitting
					= false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( accountAccess: IAccountAccessSignIn ) => {
				this.countWrongEmailTimes
					= 0;
				this.account
					= {
						...accountAccess.account,
						password: this.account.password,
					};

				this._getWorkspaces();
			},
			error: ( error: IError ) => {
				if (
					error?.error?.message
						=== ERROR_CONSTANT.MESSAGE
						.ACCOUNT_OR_PASSWORD_INVALID
					|| error?.error?.message
						=== ERROR_CONSTANT.MESSAGE
						.ACCOUNT_NOT_ACTIVATED
				) {
					this.isEmailPasswordIncorrect
						= true;
				}

				if (
					error?.error?.key
						=== ERROR_CONSTANT.KEY
						.ACCOUNT_NOT_FOUND
				) {
					this.isEmailPasswordIncorrect
						= true;

					if (
						this.wrongEmail
							=== this.account.email
					) {
						++this.countWrongEmailTimes;
					} else {
						this.wrongEmail
							= this.account.email;
						this.countWrongEmailTimes
							= 1;
					}
				}

				// if ( this.countWrongEmailTimes === 2 ) {
				// 	this.countWrongEmailTimes = 0;

				// 	this._cubToastService.info( 'AUTH.LABEL.EMAIL_NOT_EXISED', 'AUTH.MESSAGE.CREATE_NEW_ACCOUNT', { canClose: true } );
				// 	this._router.navigate(
				// 		[ CONSTANT.PATH.SIGNUP ],
				// 		{ queryParams: { email: this.account.email } } );
				// }

				if (
					error?.error?.key
						!== ERROR_CONSTANT.KEY
						.USER_LOGIN_FAIL
				) return;

				this.isEmailPasswordIncorrect
					= true;
			},
		});
	}

	/**
	 * @param {string} workspaceID
	 * @return {void}
	 */
	protected accessWorkspace(
		workspaceID: string = this.recentWorkspace?.id
	) {
		this.stateNavigate(
			[
				WORKSPACE_CONSTANT.PATH.MAIN,
				workspaceID,
			]
		);
	}

	/**
	 * @return {void}
	 */
	protected createWorkspace() {
		this._storageService.removeLocal( 'CREATE_WORKSPACE' );

		const creationPath: string
			= `${WORKSPACE_CONSTANT.PATH.MAIN}/${
				WORKSPACE_CONSTANT.PATH.CREATION}`;

		this.isAfterCollectInfo
			? this._router.navigate(
				[ creationPath ],
				{ queryParams: { isAfterCollectInfo: true } } )
			: this.stateNavigate([ creationPath ]);
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @return {void}
	 */
	protected acceptWorkspace() {
		super.stateNavigate(
			[ CONSTANT.PATH.ACCEPT_INVITATION ],
			{
				token: this.acceptToken,
				workspaceID: this.invitedWorkspaceID,
				email: this.account.email,
				name: this.account.name,
				password: this.account.password,
			}
		);
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @return {void}
	 */
	protected directAcceptWorkspace( workspace: IWorkspaceExtra ) {
		workspace.joined
			= !workspace.joined;

		super.stateNavigate(
			[ CONSTANT.PATH.ACCEPT_INVITATION ],
			{
				token: workspace.invitedToken,
				workspaceID: workspace.id,
				isDirectAccept: true,
			}
		);
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @return {void}
	 */
	protected rejectWorkspace( workspace: IWorkspaceExtra ) {
		this._cubConfirmService
		.open(
			`AUTH.MESSAGE.REVOKED_INVITATION`,
			'AUTH.MESSAGE.DECLINE_INVITATION',
			{
				warning: true,
				buttonApply: {
					text: 'AUTH.LABEL.REJECT',
					type: 'destructive',
				},
				buttonDiscard: 'AUTH.LABEL.CANCEL',
				translate: { name : workspace.name },
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.workspaces
					= _.reject(
						this.workspaces,
						{ id: workspace.id }
					);

				super.stateNavigate(
					[ CONSTANT.PATH.ACCEPT_INVITATION ],
					{
						token: workspace.invitedToken,
						workspaceID: workspace.id,
						isReject: true,
					}
				);

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected signInByGoogle() {
		if ( this._authService.isAccountAccessed ) return;

		gapi.load( 'client', () => {} );

		this.auth2
			= google.accounts.oauth2.initTokenClient({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
				scope: CONSTANT.GOOGLE_SCOPE,
				callback: this._onGoogleResponse.bind( this ),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				error_callback: ( response: { type: string } ) => {
					if ( response.type ) {
						this.isGoogleSubmitting
							= false;

						this._cdRef.markForCheck();
					};
				},
			});
	}

	/**
	 * @return {void}
	 */
	protected signInByMicrosoft() {
		this.isMicrosoftSubmitting
			= true;

		let token: IToken;
		let credential: ISocialRequest;
		const loginRequest: { scopes: string[] }
			= { scopes: [ CONSTANT.MICROSOFT_SCOPE ] };

		this._msalService
		.loginPopup( loginRequest )
		.pipe(
			catchError( () => {
				this.isMicrosoftSubmitting
					= false;

				this._cdRef.markForCheck();
				return of( undefined );
			} ),
			switchMap( ( response: AuthenticationResult | undefined ) => {
				if ( response ) {
					token
						= {
							socialID: null,
							accessToken: response.accessToken,
							type: 'microsoft',
						};
					credential
						= {
							email: '',
							token,
						};

					return this._authService.
					getMicrosoftProfile( response.accessToken );
				}
				return of( undefined );
			} )
		)
		.subscribe({
			next: ( profile: ISocialProfile | undefined ) => {
				if ( profile ) {
					this.socialProfile
						= {
							id: profile.id,
							email: profile.userPrincipalName,
							name: profile.displayName,
						};
					token
						= {
							...token,
							socialID: profile.id,
						};
					credential
						= {
							token,
							...credential,
							...{ email: profile.userPrincipalName },
						};

					this._signInSocial( credential );
				}
			},
		});
	}

	/**
	 * @param {IWorkspaceExtra} workspace
	 * @param {boolean=} isHide
	 * @return {void}
	 */
	protected focusInvitation(
		workspace: IWorkspaceExtra,
		isHide?: boolean
	) {
		this.itemFadeID
			= workspace.id;

		this._cdRef.markForCheck();

		setTimeout(
			() => {
				this.itemSelectedID
					= !isHide
						? workspace.id
						: null;

				this._cdRef.markForCheck();

				setTimeout(
					() => {
						this.itemFadeID
							= null;

						this._cdRef.markForCheck();
					},
					100
				);
			},
			100
		);
	}

	/**
	 * @return {void}
	 */
	protected switchWorkspace() {
		this._storageService.removeLocal(
			CONSTANT.RECENT_WORKSPACE_STORE_KEY
		);

		this.step
			= this.SIGNIN_STEP.workspace;
	}

	/**
	 * @return {void}
	 */
	protected afterCollectInfo() {
		this.step
			= this.SIGNIN_STEP.workspace;
		this.isAfterCollectInfo
			= true;

		this._workspaceService
		.get()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( workspaces: IWorkspace[] ) => {
				this.workspaces
					= _.map(
						workspaces,
						( workspace: IWorkspace, index: number ) => {
							return {
								...workspace,
								parsedLabel:
									this._parseLabel( workspace.name ),
								parsedColor:
									ACCENT_COLORS[
									index % ACCENT_COLORS.length
									],
							};
						}
					);

				if (
					this.workspaces
					&& this.workspaces.length === 0
				) {
					this.createWorkspace();
				}

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getWorkspaces() {
		this._workspaceService
		.get()
		.pipe(
			untilCmpDestroyed( this ),
			finalize(
				() => {
					this.loaded = true;

					this._cdRef.markForCheck();
				}
			)
		)
		.subscribe({
			next: ( workspaces: IWorkspace[] ) => {
				workspaces
					= _.orderBy(
						workspaces,
						[ 'joined', 'invitedAt' ],
						[ 'asc', 'desc' ]
					);

				const workspacesExtra: IWorkspaceExtra[]
					= _.map(
						workspaces,
						( workspace: IWorkspace, index: number ) => {
							return {
								...workspace,
								parsedLabel:
									this._parseLabel( workspace.name ),
								parsedColor:
									ACCENT_COLORS[
									index % ACCENT_COLORS.length
									],
							};
						}
					);

				this._initWorkspacesData( workspacesExtra );
			},
		});
	}

	/**
	 * @param {IWorkspaceExtra[]} workspaces
	 * @return {void}
	 */
	private _initWorkspacesData( workspaces: IWorkspaceExtra[] ) {
		this.workspaces
			= workspaces;

		const _recentWorkspace: IWorkspaceExtra
			= this._storageService.getLocal(
				CONSTANT
				.RECENT_WORKSPACE_STORE_KEY
			);

		if (
			this.step
				!== SignInComponent.SIGNIN_STEP.workspace
			|| _recentWorkspace
		) {
			this.recentWorkspace
				= _.find(
					workspaces,
					{ id: _recentWorkspace?.id }
				);

			if ( !this.account ) return;

			if ( !this.account.onBoardingFlow ) {
				this.account.onBoardingFlow
					= { isSkipped: false };
			}

			this.step = this.recentWorkspace
				? SignInComponent.SIGNIN_STEP.direct
				: SignInComponent.SIGNIN_STEP.workspace;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {any} response
	 * @return {void}
	 */
	private _onGoogleResponse( response: any ) {
		if ( response.error !== undefined ) {
			throw response;
		}

		const accessToken: string
			= gapi.client.getToken()
			.access_token;

		this._authService
		.getGoogleProfile( accessToken )
		.pipe(
			finalize( () => {
				this.isGoogleSubmitting
					= false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( profile: ISocialProfile ) => {
				this.socialProfile = profile;

				const token: IToken
					= {
						socialID: profile.id,
						accessToken,
						type: 'google',
					};
				const credential: ISocialRequest
					= {
						token,
						email: profile.email,
					};

				this._signInSocial( credential );
			},
		});
	}

	/**
	 * @param {ISocialRequest} credential
	 * @return {void}
	 */
	private _signInSocial( credential: ISocialRequest ) {
		this._authService
		.authWithSocial( credential )
		.pipe(
			finalize( () => {
				this.isGoogleSubmitting
					= false;
				this.isMicrosoftSubmitting
					= false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( accountAccess: ISocialCredential | string) => {
				if( _.isString( accountAccess ) ) {
					super.stateNavigate(
						[ CONSTANT.PATH.SIGNUP ],
						{
							token: accountAccess as string,
							email: this.socialProfile.email,
							name: this.socialProfile.name,
							workspaceID: this.invitedWorkspaceID,
						}
					);
				} else {
					this.account =
						( accountAccess as ISocialCredential )
						.account;

					this._getWorkspaces();
				}
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _signInExistAccount() {
		this.existAccount
			= this._activatedRoute.snapshot.queryParams.email;

		if ( !this.existAccount ) return;

		this._router.navigate(
			[],
			{
				relativeTo: this._activatedRoute,
				queryParams: {},
				queryParamsHandling: '',
			}
		);

		this.signInForm.get( 'email' )
		.patchValue( this.existAccount );

		this.account = {
			...this.account,
			email: this.existAccount,
		};
	}

	/**
	 * @param {string} label
	 * @param {number} characters
	 * @return {string}
	 */
	@Memoize()
	private _parseLabel(
		label: string = '',
		characters: number = 2
	): string {
		if ( !label?.length ) return '?';

		label
			= _.trim( label );

		return label.search( ' ' ) === -1
			? label.substring( 0, characters )
			: _.chain( label )
			.split( ' ' )
			.slice( 0, characters )
			.map( ( item: string ) => item.charAt( 0 ) )
			.join( '' )
			.value();
	}

}
