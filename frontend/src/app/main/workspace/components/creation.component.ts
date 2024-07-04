import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	inject
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
	finalize
} from 'rxjs/operators';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	StorageService,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	COLOR
} from '@resources';

import {
	IWorkspace,
	IWorkspaceCreate
} from '@main/workspace/interfaces';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	WorkspaceSettingService
}from '@main/workspace/modules/settings/modules/workspace/services';
import {
	AccountService
} from '@main/account/services/account.service';

import {
	CONSTANT as AUTH_CONSTANT
} from '../../auth/resources';
import {
	AuthService
} from '../../auth/services';

import {
	WorkspaceService
} from '../services';

// const ID_REGEX: RegExp = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
// const ID_MIN_LENGTH: number = 3;

@Unsubscriber()
@Component({
	selector		: 'creation',
	templateUrl		: '../templates/creation.pug',
	styleUrls		: [ '../styles/creation.scss' ],
	host			: { class: 'creation' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CreationComponent
implements OnDestroy, AfterViewInit, OnInit {

	protected readonly SIGN_IN_PATH:
		typeof AUTH_CONSTANT.PATH.SIGN_IN = AUTH_CONSTANT.PATH.SIGN_IN;
	protected readonly workspaceForm: FormGroup;

	protected isCompleted: boolean;
	protected isScrollingY: boolean;
	protected isSubmitting: boolean;
	protected isIDChecking: boolean;
	protected isAfterCollectInfo: boolean;
	protected workspace: IWorkspace = {
		settings: { primaryColor: COLOR.PRIMARY },
	} as IWorkspace;
	private _accountToken: string;
	private _cacheKey: string = 'CREATE_WORKSPACE';

	private _fb: FormBuilder =
		inject( FormBuilder );
	private _cdRef: ChangeDetectorRef =
		inject( ChangeDetectorRef );
	private _storageService: StorageService =
		inject( StorageService );
	private _authService: AuthService =
		inject( AuthService );
	private _workspaceSettingService: WorkspaceSettingService =
		inject( WorkspaceSettingService );
	private _workspaceService: WorkspaceService =
		inject( WorkspaceService );
	private _router: Router =
		inject( Router );
	private _activatedRoute: ActivatedRoute =
		inject( ActivatedRoute );
	private _accountService: AccountService =
		inject( AccountService );

	constructor() {
		this.workspaceForm = this._fb.group({
			name: [
				undefined,
				[
					Validators.required,
					Validators.maxLength( 255 ),
				],
			],
		});

		this._accountToken
			= this._authService.getStoredAuth()?.accountToken;

		if ( !this._accountToken ) {
			this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);
		}
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this.isAfterCollectInfo =
			this._activatedRoute.snapshot.queryParams.isAfterCollectInfo;

		if ( this.isAfterCollectInfo
			&& this._accountService.storedAccount ) {
			const name: string = this._getNameWorkspace(
				this._accountService.storedAccount.email );

			this.workspaceForm.controls.name.setValue( name );
			this.onNameChanged( name );
		}
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		if ( !this.isCompleted ) {
			this._workspaceSettingService.clearSettings();
		}
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		const cache: ObjectType =
			this._storageService.getLocal( this._cacheKey );

		if ( !cache || cache.token !== this._accountToken ) {
			this._storageService.removeLocal( this._cacheKey );
			return;
		}

		this.workspace = cache.workspace || this.workspace;
	}

	/**
	 * @return {void}
	 */
	protected createWorkspace() {
		this._cache();

		this.isSubmitting = true;

		const workspace: IWorkspace = _.clone( this.workspace );

		workspace.settings = {
			...this._workspaceSettingService.defaultSettings,
			...workspace.settings,
			timezone: moment.tz.guess(),
		};

		this._workspaceService
		.create( workspace )
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( result: IWorkspaceCreate ) => {
			const recentWorkspaces: IWorkspace[] =
				this._storageService.getLocal(
					AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY );

			this.isCompleted = true;

			this._storageService.removeLocal( this._cacheKey );
			this._storageService.setLocal(
				AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY,
				_.arrayInsert( recentWorkspaces, this.workspace )
			);
			this._router.navigate(
				[ WORKSPACE_CONSTANT.PATH.MAIN,result.createdWorkspace.id ]);
		} );
	}

	/**
	 * @param {string} name
	 * @return {void}
	 */
	protected onNameChanged( name: string ) {
		if ( name === this.workspace.name ) return;

		this.workspace.name = name;
	}


	/**
	 * @return {void}
	 */
	private _cache() {
		this._storageService.setLocal(
			this._cacheKey,
			{
				token		: this._accountToken,
				workspace	: this.workspace,
			}
		);
	}

	/**
	 * @param {string} email
	 * @return {string}
	 */
	private _getNameWorkspace( email: string): string {
		if ( !email ) return;

		const emailProps: string[] = _.split( email, '@' );
		const emails: string[] = [
			'gmail.com',
			'outlook.com',
			'live.com',
			'hotmail.com',
			'AOL.com',
			'Yahoo.com',
			'iCloud.com',
			'ProtonMail.com',
			'GMX.com',
			'Mail.com',
			'Yandex.com',
			'Tutanota.com',
			'Hushmail.com',
			'FastMail.com',
			'Zoho.com',
		];

		if ( _.includes( emails, emailProps[ 1 ] ) ) {
			return _.capitalize( emailProps[ 0 ] );
		} else {
			return _.capitalize( _.split( emailProps[ 1 ], '.' )[ 0 ] );
		}
	}

}
