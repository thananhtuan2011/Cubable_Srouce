import {
	Injectable,
	Injector,
	inject
} from '@angular/core';
import {
	HttpClient
} from '@angular/common/http';
// import {
// 	Platform
// } from '@angular/cdk/platform';
import {
	Observable,
	Observer,
	Subject
} from 'rxjs';
import {
	tap,
	switchMap
} from 'rxjs/operators';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	HASH
} from '@environments/hash';
// import {
// 	ENVIRONMENT
// } from '@environments/environment';

import {
	ApiHeaders,
	ApiParams,
	PageService,
	ServiceWorkerService,
	StorageService,
	WebSocketService
} from '@core';

import {
	IAccount,
	IResetPassword
} from '@main/account/interfaces/account.interface';
import {
	AccountService
} from '@main/account/services/account.service';
import {
	IWorkspaceAccessBase
} from '@main/workspace/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	WorkspaceSettingService
} from '@main/workspace/modules/settings/modules/workspace/services/workspace-setting.service';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	CONSTANT as ACCOUNT_CONSTANT
} from '@main/account/resources';
import {
	AccountApiService
} from '@main/account/services';

import {
	IAcceptInvitation,
	IAccountAccessSignIn,
	IAccountAccessSignUp,
	IAuth,
	IInspectInvitation,
	ISocialCredential,
	ISocialProfile,
	ISocialRequest,
	IVerifyData,
	IVerifySignUp
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

@Injectable({ providedIn: 'root' })
export class AuthService {

	public static readonly IGNORE_MARK_LAST_PATHS: string[] = [
		CONSTANT.PATH.RESET_PASSWORD,
		CONSTANT.PATH.SET_PASSWORD,
		CONSTANT.PATH.SIGN_IN,
		CONSTANT.PATH.SIGN_OUT,
		CONSTANT.PATH.SIGNUP,
		CONSTANT.PATH.ACCEPT_INVITATION,
		WORKSPACE_CONSTANT.PATH.CREATION,
	];

	private readonly _apiService: AccountApiService
		= inject( AccountApiService );
	private readonly _endPoint: string = '/account';

	private _storedAuth: IAuth;
	private _workspaceService: WorkspaceService
		= this._injector.get( WorkspaceService );
	private _apiGoogleUrl: string
		= 'https://www.googleapis.com/oauth2/v1/userinfo';
	private _apiMicrosoftUrl: string
		= 'https://graph.microsoft.com/v1.0/me';

	get isAccountAccessed(): boolean {
		return !!this.getStoredAuth()?.accountID;
	}
	get isWorkspaceAccessed(): boolean {
		return !!this.getStoredAuth()?.workspaceID;
	}

	public $isExistAccount: Subject<boolean> = new Subject<boolean>();

	/**
	 * @constructor
	 * @param {StorageService} _storageService
	 * @param {Injector} _injector
	 * @param {Platform} _platform
	 * @param {PageService} _pageService
	 * @param {AccountService} _accountService
	 * @param {WebSocketService} _webSocketService
	 * @param {ServiceWorkerService} _serviceWorkerService
	 * @param {HttpClient} _httpClient
	 * @param {WorkspaceSettingService} _workspaceSettingService
	 */
	constructor(
		private _storageService: StorageService,
		private _injector: Injector,
		// private _platform: Platform,
		private _pageService: PageService,
		private _accountService: AccountService,
		private _serviceWorkerService: ServiceWorkerService,
		private _webSocketService: WebSocketService,
		private _httpClient: HttpClient,
		private _workspaceSettingService: WorkspaceSettingService
	) {
		// this._platform.SAFARI && this._storageService.setCookieOptions({ sameSite: 'Lax', secure: false });

		window.addEventListener( 'beforeunload', () => {
			if (
				this._accountService.storedAccount
				&& this._accountService.storedAccount.logoutSetting
				&& this._accountService.storedAccount.logoutSetting.type
					=== ACCOUNT_CONSTANT.LOGOUT_SETTING_TYPE.CLOSE_BROWSER
			) {
				this.signout()
				.pipe(
					switchMap( () => { return this._accountService.delete(); } )
				)
				.subscribe();
			}
		});
	}

	/**
	 * @param {string} accessToken
	 * @return {Observable}
	 */
	public getGoogleProfile( accessToken: string ): Observable<ISocialProfile> {
		const headers: ApiHeaders = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			// eslint-disable-next-line quote-props, @typescript-eslint/naming-convention
			'Authorization': `Bearer ${ accessToken }`,
		};

		return this._httpClient
		.get<ISocialProfile>( `${this._apiGoogleUrl}`, { headers } );
	}

	/**
	 * @param {string} accessToken
	 * @return {Observable}
	 */
	public getMicrosoftProfile(
		accessToken: string
	): Observable<ISocialProfile> {
		const headers: ApiHeaders = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			// eslint-disable-next-line quote-props, @typescript-eslint/naming-convention
			'Authorization': `Bearer ${ accessToken }`,
		};

		return this._httpClient
		.get<ISocialProfile>( `${this._apiMicrosoftUrl}`, { headers } );
	}

	/**
	 * @return {Observable}
	 */
	public accountInfo(): Observable<IAccount> {
		return this._apiService
		.call(
			`${this._endPoint}/info`,
			'GET'
		)
		.pipe(
			tap( ( account: IAccount ) => {
				this._accountService.storedAccount = account;
			} )
		);
	}

	/**
	 * @param {IAccount} account
	 * @return {Observable}
	 */
	public signin( account: IAccount ): Observable<IAccountAccessSignIn> {
		const params: ApiParams
			= {
				email: account.email,
				password: _.aesEncrypt( account.password ),
			};

		return this._apiService
		.call( `${this._endPoint}/signin`, 'POST', params )
		.pipe( tap( ( result: IAccountAccessSignIn ) => {
			this._accountService.storedAccount = result.account;

			this.setStoredAuth({
				accountToken: result.accountToken,
				accountID: result.account?.email,
			});
		} ) );
	}

	/**
	 * @param {ISocialRequest} credential
	 * @return {Observable}
	 */
	public authWithSocial(
		credential: ISocialRequest
	): Observable<ISocialCredential> {
		const params: ApiParams
			= {
				email: credential.email,
				token: _.aesEncrypt( credential.token ),
			};

		return this._apiService
		.call( `${this._endPoint}/check-available-social`, 'POST', params )
		.pipe( tap( ( result: ISocialCredential ) => {
			this._accountService.storedAccount = result.account;

			this.setStoredAuth({
				accountToken: result.accountToken,
				accountID: result.account?.email,
			});
		} ) );
	}

	/**
	 * @return {Observable}
	 */
	public signout(): Observable<void> {
		const userService: UserService = this._injector.get( UserService );

		return new Observable( ( observer: Observer<void> ) => {
			// Clear stored auth
			this.clearStoredAuth();

			// Clear stored account
			this._accountService.clearStoredAccount();

			// Clear workspace settings
			this._workspaceSettingService.clearSettings();

			// Clear stored workspace
			this._workspaceService.clearStoredWorkspace();

			// Clear stored user
			userService.clearStoredUser();

			// Clear all stored cookies
			this._storageService.clearAllCookies();

			// Clear all stored local
			this._storageService.removeLocal(
				CONSTANT.RECENT_WORKSPACE_STORE_KEY
			);

			// Reset cached current url
			this._pageService.setCurrentURL( null );

			// Disable service worker push notification
			this._serviceWorkerService.disablePushNotification();

			// Disconnect socket
			this._webSocketService.disconnect();

			observer.next();
		} );
	}

	/**
	 * @param {string} type
	 * @param {string} email
	 * @return {Observable}
	 */
	public sendOTP( type: string, email: string ): Observable<void> {
		const params: ApiParams = { email };

		switch ( type ) {
			case CONSTANT.SCREEN_TYPE.SIGNUP:
				return this._apiService.call( `${this._endPoint}/send-signup-otp`, 'POST', params );
			case CONSTANT.SCREEN_TYPE.RESET_PASSWORD:
				return this._apiService.call( `${this._endPoint}/send-reset-password-otp`, 'POST', params );
		}
	}

	/**
	 * @param {IVerifyData} data
	 * @return {Observable}
	 */
	public verifySignUpOTP( data: IVerifyData ): Observable<IVerifySignUp> {
		return this._apiService
		.call(
			`${this._endPoint}/verify-signup-otp`,
			'POST',
			data
		);
	}

	/**
	 * @param {IVerifyData} data
	 * @return {Observable}
	 */
	public verifyResetPasswordOTP(
		data: IVerifyData
	): Observable<IResetPassword> {
		return this._apiService
		.call(
			`${this._endPoint}/verify-reset-password-otp`,
			'POST',
			data
		);
	}

	/**
	 * @param {string} token
	 * @param {IAccount} account
	 * @param {string=} referralCode
	 * @return {Observable}
	 */
	public signup(
		token: string,
		account: IAccount,
		referralCode?: string
	): Observable<IAccountAccessSignUp> {
		const params: ApiParams = {
			referralCode,
			email	: account.email,
			name	: account.name,
			password: _.aesEncrypt( account.password ),
		};

		return this._apiService
		.call(
			`${this._endPoint}/signup?token=${encodeURIComponent( token )}`,
			'POST',
			params
		);
	}

	/**
	 * @param {string} token
	 * @param {IAccount} account
	 * @return {Observable}
	 */
	public resetPassword(
		token: string,
		account: IAccount
	): Observable<void> {
		const params: ApiParams = {
			email	: account.email,
			password: _.aesEncrypt( account.password ),
		};

		return this._apiService
		.call(
			`${this._endPoint}
				/reset-password
				?token=${encodeURIComponent( token )}`,
			'POST',
			params
		);
	}

	/**
	 * @param {string} token
	 * @return {Observable}
	 */
	public inspectInvitation( token: string ): Observable<IInspectInvitation> {
		return this._apiService
		.call(
			`${this._endPoint}
				/inspect-invitation
				?token=${encodeURIComponent( token )}`,
			'GET'
		);
	}

	/**
	 * @param {string} token
	 * @param {IAccount} account
	 * @return {Observable}
	 */
	public acceptInvitation(
		token: string,
		account: IAccount
	): Observable<IAcceptInvitation> {
		const params: ApiParams = {
			name: account.name,
			password: _.aesEncrypt( account.password ),
		};

		return this._apiService
		.call(
			`${this._endPoint}
				/accept-invitation
				?token=${encodeURIComponent( token )}`,
			'POST',
			params
		)
		.pipe( tap( ( result: IAcceptInvitation ) => {
			if ( !result ) return;

			this._workspaceService.storedWorkspace = result.workspace;

			if ( result.account ) {
				this._accountService.storedAccount = result.account;
			}

			this.setStoredAuth({
				workspaceToken	: result.workspaceToken,
				workspaceID		: result.workspace.id,
				accountID		: result.account.email,
				accountToken	: result.accountToken,
			});
		} ) );
	}

	/**
	 * @param {string} token
	 * @param {boolean} autoAccess
	 * @return {Observable}
	 */
	public directAcceptInvitation(
		token: string
	): Observable<IWorkspaceAccessBase> {
		return this._apiService
		.call(
			`${this._endPoint}/direct-accept-invitation`,
			'POST',
			{ token }
		)
		.pipe(
			tap( ( result: IWorkspaceAccessBase ) => {
				if ( !result ) return;

				this._workspaceService.storedWorkspace = result.workspace;

				const auth: IAuth = this.getStoredAuth();

				this.setStoredAuth({
					workspaceToken: result.workspaceToken,
					workspaceID: result.workspace.id,
					accountID: this._accountService.storedAccount?.email
						|| auth.accountID,
					accountToken: auth.accountToken,
				});
			} )
		);
	}

	/**
	 * @param {string} token
	 * @return {Observable}
	 */
	public rejectInvitation( token: string ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/reject-invitation`,
			'POST',
			{ token }
		);
	}

	/**
	 * @param {IAuth} authData
	 * @return {void}
	 */
	public setStoredAuth( authData: IAuth ) {
		this._storedAuth = authData;

		if ( !authData ) return;

		// // Enable service worker push notification
		// this._serviceWorkerService
		// .enablePushNotification({
		// 	onNotificationClicked: ( { notification }: { notification: NotificationOptions } ) => window.open(
		// 		`${ENVIRONMENT.APP_URL}/notification?notificationID=${notification?.data?.notificationID}`
		// 	),
		// });

		// Store authentication data
		this._storageService.setCookie(
			HASH.AUTHORIZED_KEY,
			authData,
			moment()
			.add( 2, 'y' )
			.toDate()
		);
	}

	/**
	 * @return {IAuth}
	 */
	public getStoredAuth(): IAuth {
		if ( !this._storedAuth ) {
			this._storedAuth
				= this._storageService.getCookie( HASH.AUTHORIZED_KEY );
		}

		return this._storedAuth;
	}

	/**
	 * @return {void}
	 */
	public clearStoredAuth() {
		this._storedAuth = undefined;
	}

	/**
	 * @return {void}
	 */
	public markLastPathBeforeSignOut() {
		const firstPathName: string
			= window.location.pathname.split( '/' )[ 1 ];

		if (
			_.includes( AuthService.IGNORE_MARK_LAST_PATHS, firstPathName )
		) return;

		this._pageService.setCurrentURL();
	}

}
