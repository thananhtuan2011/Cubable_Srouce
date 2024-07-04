import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	inject,
	isDevMode
} from '@angular/core';
import {
	ActivatedRoute,
	ActivatedRouteSnapshot,
	ActivationEnd,
	NavigationEnd,
	NavigationError,
	Router,
	RouterEvent,
	RouterState
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, finalize } from 'rxjs/operators';
import _ from 'lodash';

import { ENVIRONMENT } from '@environments/environment';
import { HASH } from '@environments/hash';

import {
	ApiService,
	MediaService,
	NetworkService,
	PageService,
	StorageService,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import { DialogLimitationWarningComponent } from '@error/components';
import { IError } from '@error/interfaces';
import { CONSTANT as ERROR_CONSTANT } from '@error/resources';
import { ErrorService } from '@error/services';

import { WGCDialogService } from '@wgc/wgc-dialog';
import { WGCIToastConfig, WGCToastService } from '@wgc/wgc-toast';

import { IAccount } from '@main/account/interfaces';
import { AccountService } from '@main/account/services';
import { IAuth } from '@main/auth/interfaces';
import { CONSTANT as AUTH_CONSTANT } from '@main/auth/resources';
import { AuthService } from '@main/auth/services';
import { IField } from '@main/common/field/interfaces';
import { IWorkspace } from '@main/workspace/interfaces';
import { CONSTANT as WORKSPACE_CONSTANT } from '@main/workspace/resources';
import { WorkspaceService } from '@main/workspace/services';

import { CONSTANT } from '@resources';

@Unsubscriber()
@Component({
	selector		: 'app',
	templateUrl		: './app.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {

	private readonly _errorService: ErrorService = inject( ErrorService );

	public displayHelpCenter: boolean = true;
	public isReady: boolean;
	public account: IAccount;
	public workspace: IWorkspace;

	/**
	 * @constructor
	 * @param {AccountService} _accountService
	 * @param {ApiService} _apiService
	 * @param {AuthService} _authService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {MediaService} _mediaService
	 * @param {NetworkService} _networkService
	 * @param {PageService} _pageService
	 * @param {Router} _router
	 * @param {StorageService} _storageService
	 * @param {TranslateService} _translateService
	 * @param {WGCToastService} _wgcToastService
	 * @param {WorkspaceService} _workspaceService
	 * @param {WGCDialogService} _wgcDialogService
	 */
	constructor(
		private _accountService: AccountService,
		private _apiService: ApiService,
		private _authService: AuthService,
		private _cdRef: ChangeDetectorRef,
		private _mediaService: MediaService,
		private _networkService: NetworkService,
		private _pageService: PageService,
		private _router: Router,
		private _storageService: StorageService,
		private _translateService: TranslateService,
		private _wgcToastService: WGCToastService,
		private _workspaceService: WorkspaceService,
		private _wgcDialogService: WGCDialogService
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._routerEventsCatcher();
		this._networkFailCatcher();

		if ( isDevMode() ) {
			this.isReady = true;

			this._cdRef.markForCheck();
			this._apiErrorCatcher();
			this._initData();
			this._initSubscriber();
			return;
		}

		// Ping api server
		this._apiService
		.call( '/ping' )
		.pipe(
			finalize( () => {
				this.isReady = true;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._apiErrorCatcher();
				this._initData();
				this._initSubscriber();
			},
			error: () => {
				this
				._router
				.navigate([ ERROR_CONSTANT.PATH.MAINTENANCE ]);
			},
		});
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._mediaService.setViewPort( 1280 );
	}

	/**
	 * @return {void}
	 */
	private _routerEventsCatcher() {
		this._router.events
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: RouterEvent ) => {
			switch ( true ) {
				case event instanceof NavigationError:
					this._pageService.setCurrentURL( null );
					this._router.navigate([ '404' ]);
					break;

				case event instanceof NavigationEnd:
					window.scrollTo( 0, 0 );
					window.location.href.substring(
						0,
						window.location.href.indexOf( '#' )
					);

					const state: RouterState = this._router.routerState;
					const title: string[]
						= this._getStateTitle( state, state.root );

					// Set page title
					this._pageService.setTitle(
						_.join( title, ' - ' )
						|| ENVIRONMENT.APP_TITLE
					);
					break;

				case event instanceof ActivationEnd:
					const snapshot: ActivatedRouteSnapshot
						= ( event as unknown as ActivationEnd ).snapshot;

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
					snapshot.data.helpCenter === false
						? this._hideHelpCenter()
						: this._showHelpCenter();

					if ( snapshot.data.cache !== false ) {
						this._pageService.setCurrentURL();
					}
					break;
			}
		} );
	}

	/**
	 * @return {void}
	 */
	private _networkFailCatcher() {
		let toastID: number;

		this._networkService
		.detectOnline()
		.pipe( distinctUntilChanged() )
		.subscribe( ( isOnline: boolean ) =>
			isOnline
				? toastID && this._wgcToastService.close( toastID )
				: toastID = this._wgcToastService.info(
					'APP.LABEL.NO_INTERNET',
					'APP.MESSAGE.NO_INTERNET',
					{ canClose: false }
				)
		);
	}

	/**
	 * @return {void}
	 */
	private _apiErrorCatcher() {
		const throwWarning: ReturnType<typeof _.throttle> = _.throttle(
			( title: string, message: string, config?: WGCIToastConfig ) => {
				this._wgcToastService.warning( title, message, config );
			},
			2000
		);
		const throwError: ReturnType<typeof _.throttle> = _.throttle(
			( title: string, message: string, config?: WGCIToastConfig ) => {
				this._wgcToastService.danger( title, message, config );
			},
			2000
		);

		this._errorService.errorCatcher$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( err: IError ) => {
			const key: string
				= err.error.key;

			switch ( err.status ) {
				case 401:
					throwWarning(
						'APP.LABEL.SESSION_EXPIRED',
						'APP.MESSAGE.SESSION_EXPIRED'
					);

					// this._authService.markLastPathBeforeSignOut(); improve later
					this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_OUT ]);
					break;
				case 400:
					//Temp
					if ( key === ERROR_CONSTANT.KEY.REJECTED_INVITATION
						|| key === ERROR_CONSTANT.KEY.DELETED_INVITATION
						|| key === ERROR_CONSTANT.KEY.EXPIRED_INVITATION
					) {
						break;
					} else {
						const messageErr: string
							= err.error.message;
						const keyErr: string
							= err.error.key;

						if (
							messageErr === 'account not activated!'
								|| messageErr === 'account or password invalid!'
								|| messageErr === 'otps mismatched!'
								|| messageErr === 'account exists!'
								|| messageErr === 'no shared base/board(s)'
								|| messageErr === 'role notfound!'
								|| messageErr === 'workspace or token invalid!'
								|| keyErr === 'FILTER_INVALID'
						) {
							break;
						}

						throwError(
							'ERROR.LABEL.BAD_REQUEST',
							'ERROR.MESSAGE.BAD_REQUEST'
						);

						break;
					}
				case 403:
					const keyError: string
						= err.error.key;

					if (
						keyError === ERROR_CONSTANT.KEY.PERMISSION_DENIED
					) {
						break;
					}

					throwError(
						'ERROR.LABEL.ACCESS_DENIED',
						'ERROR.MESSAGE.ACCESS_DENIED'
					);

					break;
				case 420:
					if ( key === ERROR_CONSTANT.KEY.ACCOUNT_NOT_FOUND
						|| key === ERROR_CONSTANT.KEY.ITEM_NOT_AVAILABLE_ON_VIEW
						|| key === ERROR_CONSTANT.KEY.REACH_LIMITATION_MEMBERS
					) {
						break;
					}

					if (
						key === ERROR_CONSTANT.KEY.REACH_WORKSPACE_LIMITATION
					) {
						this._wgcDialogService.open(
							DialogLimitationWarningComponent,
							{ width: '440px' }
						);
						break;
					}

					const title: string
						= 'ERROR.LABEL.BUSINESS_EXCEPTION';
					const message: string
						= ERROR_CONSTANT.KEY[ key ]
							? `ERROR.MESSAGE.${ERROR_CONSTANT.KEY[ key ]}`
							: err.error.message;
					let config: WGCIToastConfig;

					switch ( key ) {
						case ERROR_CONSTANT.KEY.MISSING_REQUIRED_FIELD:
							config = {
								translateParams: {
									// fields: _.arrayJoin( _.map( err.error.data.requiredFields, ( field: IField ) => field.aliasName || field.name ) ),
									fields: _.arrayJoin(
										_.map(
											err.error.data.requiredFields,
											( field: IField ) => field.name
										)
									),
								},
							};
							break;
						case ERROR_CONSTANT.KEY.BILLING_3P_ERROR:
						case ERROR_CONSTANT.KEY.BILLING_3P_INVOICE_ERROR:
						case ERROR_CONSTANT.KEY.BILLING_UPGRADE_STACK:
						case ERROR_CONSTANT.KEY.BILLING_MIN_PAY_LIMIT:
							config = {
								translateParams: {
									email	: CONSTANT.MAIL_HELPER,
									hotline	: CONSTANT.HOTLINE,
								},
							};
							break;
					}

					throwError( title, message, config );
					break;
				default:
					throwError(
						'ERROR.LABEL.SOMETHING_WENT_WRONG',
						'ERROR.MESSAGE.SOMETHING_WENT_WRONG'
					);
			}
		} );
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		if ( !this._storageService.getCookie( HASH.AUTHORIZED_KEY ) ) {
			this._workspaceService.setStoredWorkspaceInitChange$.next( null );
			return;
		}
		const pathNames: string[] = window.location.pathname.split( '/' );
		const primaryPath: string = pathNames[ 1 ];
		const secondaryPath: string = pathNames[ 2 ];

		if ( primaryPath !== AUTH_CONSTANT.PATH.SIGN_IN ) {
			this._authService
			.accountInfo()
			.pipe( untilCmpDestroyed( this ) )
			.subscribe();
		}

		const storedAuth: IAuth
			= this._authService.getStoredAuth();
		const workspaceID: string
			= secondaryPath || storedAuth?.workspaceID;

		if ( primaryPath === WORKSPACE_CONSTANT.PATH.MAIN
			&& workspaceID !== storedAuth.workspaceID ) {
			this._workspaceService.clearStoredWorkspace();
			return;
		}

		// SESSION_EXPIRED remove temp
		// Copy/Paste URL at sign-in screen
		primaryPath === AUTH_CONSTANT.PATH.SIGN_IN
			&& workspaceID
			&& this._router.navigate([
				WORKSPACE_CONSTANT.PATH.MAIN,
				workspaceID,
			]);
	}

	/**
	 * @return {void}
	 */
	private _initSubscriber() {
		this._accountService.storedAccountChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( account: IAccount ) => {
			this.account = account;

			this._cdRef.markForCheck();
		} );

		this._workspaceService.storedWorkspaceChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( workspace: IWorkspace ) => {
			this.workspace = workspace;

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @param {RouterState} state
	 * @param {ActivatedRoute} parent
	 * @return {string[]}
	 */
	private _getStateTitle(
		state: RouterState,
		parent: ActivatedRoute
	): string[] {
		const data: string[] = [];

		if ( parent && parent.snapshot.data ) {
			if ( parent.snapshot.data.translate ) {
				data.push(
					this._translateService.instant(
						parent.snapshot.data.translate
					)
				);
			} else {
				if ( parent.snapshot.data.title ) {
					data.push( parent.snapshot.data.title );
				}
			}
		}

		if ( state && parent ) {
			data.push(
				...this._getStateTitle(
					state,
					( state as any ).firstChild( parent )
				)
			);
		}

		return data;
	}

	/**
	 * @return {void}
	 */
	private _showHelpCenter() {
		this.displayHelpCenter = true;
	}

	/**
	 * @return {void}
	 */
	private _hideHelpCenter() {
		this.displayHelpCenter = false;
	}

}
