import {
	Component,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	OnInit,
	inject
} from '@angular/core';
import {
	ActivatedRoute,
	Router
} from '@angular/router';
import _ from 'lodash';

import {
	PageService,
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
	AccountService
} from '@main/account/services';
import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';
import {
	AuthService
} from '@main/auth/services';
import {
	CUBToastService
} from '@cub/material/toast';

import {
	IWorkspace,
	IWorkspaceAccess
} from '../interfaces';
// import { TemplateService } from '../modules/template/services';
// import { CONSTANT as TEMPLATE_CONSTANT } from '../modules/template/resources';
import {
	UserService
} from '../modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	WorkspaceSettingService
} from '../modules/settings/modules/workspace/services';
import {
	CONSTANT
} from '../resources';
import {
	WorkspaceService
} from '../services';

@Unsubscriber()
@Component({
	selector		: 'workspace',
	templateUrl		: '../templates/workspace.pug',
	styleUrls		: [ '../styles/workspace.scss' ],
	host			: { class: 'workspace' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {

	public workspace: IWorkspace;

	private readonly _accountService: AccountService
		= inject( AccountService );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _authService: AuthService
		= inject( AuthService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _storageService: StorageService
		= inject( StorageService );
	private readonly _pageService: PageService
		= inject( PageService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _router: Router
		= inject( Router );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _workspaceService: WorkspaceService
		= inject( WorkspaceService );
	private readonly _workspaceSettingService: WorkspaceSettingService
		= inject( WorkspaceSettingService );

	ngOnInit() {
		this._initData();
		this._initSubscription();
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		const workspaceID: string = this._activatedRoute.snapshot.paramMap.get( 'workspaceID' );

		this._workspaceService
		.access( workspaceID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( result: IWorkspaceAccess ) => {
				this._storageService.setLocal(
					AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY,
					result.workspace
				);

				// const templateID: string = TemplateService.getTemplateID();

				// if ( templateID ) {
				// 	this._router.navigate([ TEMPLATE_CONSTANT.PATH.MAIN ], { queryParams: { templateID } });
				// 	return;
				// }

				const pathNames: string[] = window.location.pathname.split( '/' );
				const primaryPath: string = pathNames[ 1 ];
				const secondaryPath: string = pathNames[ 2 ];
				const currentURL: string = this._pageService.getCurrentURL();
				const currentURLPathNames: string[] = currentURL?.split( '/' );
				const secondaryCurrentURLPath: string
					= currentURLPathNames[ 2 ];

				if ( !_.isStrictEmpty( secondaryCurrentURLPath )
					&& primaryPath === CONSTANT.PATH.MAIN
					&& secondaryPath !== secondaryCurrentURLPath ) {
					const newCurrentURL: string = currentURL.replace(
						`/${CONSTANT.PATH.MAIN}/${secondaryCurrentURLPath}`,
						`/${CONSTANT.PATH.MAIN}/${secondaryPath}`
					);

					this._pageService.setCurrentURL( newCurrentURL );
				}

				this._pageService
				.navigateToCurrentURL(
					{
						replaceUrl: this._router.url
							=== `/${CONSTANT.PATH.MAIN}/${workspaceID}`,
					}
				);
			},
			error: ( err: IError ) => {
				if (
					err.error?.key === ERROR_CONSTANT.KEY.PERMISSION_DENIED
				 ) {
					this._userService.clearStoredUser();
					this._workspaceService.clearStoredWorkspace();
					this._authService.setStoredAuth({
						accountID:
							this._accountService.storedAccount?.email,
						accountToken:
							this._authService.getStoredAuth()?.accountToken,
					});

					this._storageService.removeLocal(
						AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY
					);

					this._toastService
					.danger(
						'WORKSPACE.MESSAGE.NOT_ACCESS_WORKSPACE'
					);
				}

				this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this._workspaceService.storedWorkspaceChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( workspace: IWorkspace ) => {
			this.workspace = workspace;

			this._cdRef.markForCheck();
			this._workspaceSettingService.applySettings(
				this.workspace?.settings
			);
		} );
	}

}
