import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnInit,
	TemplateRef,
	inject
} from '@angular/core';
import {
	ActivatedRoute,
	NavigationEnd,
	Router,
	RouterEvent
} from '@angular/router';
import {
	filter
} from 'rxjs/operators';

import {
	CoerceBoolean,
	DefaultValue,
	LocaleService,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	IAccount
} from '@main/account/interfaces';
import {
	CONSTANT as ACCOUNT_CONSTANT
} from '@main/account/resources';
import {
	CONSTANT as BASE_CONSTANT
} from '@main/workspace/modules/base/resources';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	AccountService
} from '@main/account/services';
import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';
import {
	IWorkspace,
	IWorkspaceAccess
} from '@main/workspace/interfaces';
import {
	WorkspaceExpandService,
	WorkspaceService
} from '@main/workspace/services';
import {
	IUserRole
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	CONSTANT as SETTINGS_CONSTANT
} from '@main/workspace/modules/settings/resources';
import {
	SettingsDialogService
} from '@main/workspace/modules/settings/services';
import {
	WorkspaceSettingService
} from '@main/workspace/modules/settings/modules/workspace/services';
import {
	NotificationService
} from '@main/workspace/modules/notification/services';
import {
	NotificationCount
} from '@main/workspace/modules/notification/interfaces';

import {
	NavigationBarService
} from '../services';

@Unsubscriber()
@Component({
	selector: 'navigation-bar',
	templateUrl: '../templates/navigation-bar.pug',
	styleUrls: [ '../styles/navigation-bar.scss' ],
	host: { class: 'navigation-bar' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationBarComponent
implements OnInit {

	@Input() @DefaultValue() @CoerceBoolean()
	public hasFeatureModule: boolean = true;

	protected readonly ACCOUNT_SETTINGS_PATH:
	typeof ACCOUNT_CONSTANT.PATH.ACCOUNT_SETTINGS
		= ACCOUNT_CONSTANT.PATH.ACCOUNT_SETTINGS;
	protected readonly USER_PATH: string
		= `${SETTINGS_CONSTANT.PATH.MAIN}/${SETTINGS_CONSTANT.PATH.USER}`;
	protected readonly WORKSPACE_PATH: string
		= `${SETTINGS_CONSTANT.PATH.MAIN}/${SETTINGS_CONSTANT.PATH.WORKSPACE}`;
	protected readonly BASE_PATH: typeof BASE_CONSTANT.PATH.MAIN
		= BASE_CONSTANT.PATH.MAIN;
	protected readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );

	protected canRedirect: boolean;
	protected countNotification: NotificationCount;
	protected currentMainModule: string;
	protected account: IAccount;
	protected workspace: IWorkspace;
	protected userRole: IUserRole;
	protected contentTmp: TemplateRef<any>;

	private readonly _navigationBarService: NavigationBarService
		= inject( NavigationBarService );
	private readonly _workspaceExpandService: WorkspaceExpandService
		= inject( WorkspaceExpandService );

	get isAdministrator(): boolean {
		return this._userService.isAdministrator();
	}

	/**
	 * @constructor
	 * @param {LocaleService} localeService
	 * @param {AccountService} _accountService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {ActivatedRoute} _activatedRoute
	 * @param {Router} _router
	 * @param {SettingsDialogService} _settingsDialogService
	 * @param {UserService} _userService
	 * @param {WorkspaceSettingService} _workspaceSettingService
	 * @param {WorkspaceService} _workspaceService
	 * @param {CUBDialogRef} _dialogRef
	 * @param {NotificationService} _notificationService
	 */
	constructor(
		public localeService: LocaleService,
		private _accountService: AccountService,
		private _cdRef: ChangeDetectorRef,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _settingsDialogService: SettingsDialogService,
		private _userService: UserService,
		private _workspaceSettingService: WorkspaceSettingService,
		private _workspaceService: WorkspaceService,
		private _notificationService: NotificationService
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._countNotification();
		this._routerEventsCatcher();
		this._initSubscription();

		this.currentMainModule = window.location.pathname.split( '/' )[ 3 ];
	}

	/**
	 * @return {void}
	 */
	public signOut() {
		this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_OUT ]);
	}

	/**
	 * @param {string} lang
	 * @return {void}
	 */
	public changeLanguage( lang: string ) {
		this.localeService.useLocale( lang );
	}

	/**
	 * @return {void}
	 */
	public inviteUser() {
		this._settingsDialogService.openDialogInviteUser();
		// this._userService
		// .checkMembersLimit()
		// .pipe( untilCmpDestroyed( this ) )
		// .subscribe({ next: () => this._settingsDialogService.openDialogInviteUser() });
	}

	/**
	 * @return {void}
	 */
	public switchWorkspace() {
		this._workspaceSettingService.switchWorkspace();
	}

	/**
	 * @param {string} path
	 * @return {void}
	 */
	public navigate( path: string ) {
		if ( !path ) return;

		this._handleNavigate( () => this._navigateToPath( path ) );
	}

	/**
	 * @return {void}
	 */
	protected navigateToMainPath() {
		this._handleNavigate( () => this._navigateToMainPath() );
	}

	protected openDialogNotification() {
		this._workspaceExpandService
		.openDialogNotification();

		this.countNotification.newNotification = 0;
	}

	/**
	 * @return {void}
	 */
	private _countNotification() {
		this._notificationService
		.countNotification()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( count: NotificationCount ) => {
				this.countNotification = count;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _routerEventsCatcher() {
		this._router.events
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: RouterEvent ) => {
			switch ( true ) {
				case event instanceof NavigationEnd:
					this.currentMainModule = event.url.split( '/' )[ 3 ];

					this._cdRef.markForCheck();
					break;
			}
		} );
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this._workspaceService.storedWorkspaceInitChange$
		.pipe(
			filter(
				( workspaceAccess: IWorkspaceAccess ) => !!workspaceAccess
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( workspaceAccess: IWorkspaceAccess ) => {
				// this._directionService.update( 'notification', { highlight: workspaceAccess.userData.unreadNotificationCount > 0 } );

				this.userRole = workspaceAccess.user.role;
			},
		});

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
			this._workspaceSettingService.applySettings(
				this.workspace?.settings
			);
		} );

		this._navigationBarService.contentTmp$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( contentTmp: TemplateRef<any> ) => {
			this.contentTmp = contentTmp;

			this._cdRef.markForCheck();
		} );

		this._navigationBarService.canRedirect$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( canRedirect: boolean ) => {
			this.canRedirect = canRedirect;
		} );
	}

	/**
	 * @return {void}
	 */
	private _handleNavigate( navigateFn: () => void ) {
		if ( !this.canRedirect ) {
			this._cubConfirmService
			.open(
				`NAVIGATION.MESSAGE.CANCEL_MESSAGE`,
				'NAVIGATION.MESSAGE.LOST_CURRENT_PROGRESS',
				{
					warning: true,
					buttonApply: {
						text: 'NAVIGATION.LABEL.CONFIRM_CANCEL',
						type: 'destructive',
					},
					buttonDiscard: 'NAVIGATION.LABEL.KEEP',
				}
			)
			.afterClosed()
			.subscribe({
				next: ( answer: boolean ) => {
					if ( !answer ) return;

					navigateFn();
				},
			});
		} else {
			navigateFn();
		}
	}

	/**
	 * @param {string} path
	 * @return {any}
	 */
	private _navigateToPath( path: string ) {
		this._router.navigate(
			[ path ],
			{ relativeTo: this._activatedRoute }
		);

		this._notificationService.storedBaseID = null;
		this._navigationBarService.canRedirect$.next( true );
	}
	/**
	 * @return {any}
	 */
	private _navigateToMainPath() {
		this._router.navigateByUrl(
			// eslint-disable-next-line max-len
			`${WORKSPACE_CONSTANT.PATH.MAIN}/${this.workspace.id}/${BASE_CONSTANT.PATH.MAIN}`
		);

		this._navigationBarService.canRedirect$.next( true );
	}

}
