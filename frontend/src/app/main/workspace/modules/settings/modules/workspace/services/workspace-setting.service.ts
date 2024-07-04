import {
	Inject,
	Injectable,
	Injector,
	inject,
	Optional
} from '@angular/core';
import {
	Router
} from '@angular/router';
import {
	Observable,
	Observer
} from 'rxjs';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	AppearanceService,
	DATE_TIME_CONFIG,
	DateTimeConfig,
	PageService,
	StorageService,
	WebSocketService
} from '@core';

import {
	COLOR,
	CONSTANT as APP_CONSTANT
} from '@resources';

import {
	WGC_CLOUD_STORAGE_CONFIG,
	WGCCloudStorageConfig
} from '@wgc/wgc-file-picker';

import {
	AccountService
} from '@main/account/services';
import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';
import {
	AuthService
} from '@main/auth/services/auth.service';
import {
	IWorkspace
} from '@main/workspace/interfaces';
import {
	WorkspaceService,
	WorkspaceApiService
} from '@main/workspace/services';

import {
	WorkspaceSettings
} from '../interfaces';
import {
	UserService
} from '../modules/user-system/modules/user/services';
import {
	CONSTANT
} from '../resources';

export interface ICheckAvailableIDResponse {
	isAvailable: boolean;
	suggestedID: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceSettingService {

	// public readonly setStoredWorkspaceInitChange$: BehaviorSubject<IWorkspaceAccess> = new BehaviorSubject<IWorkspaceAccess>( undefined );

	// private _storedWorkspace: IWorkspace;
	// private _storedWorkspaceChange$: BehaviorSubject<IWorkspace> = new BehaviorSubject<IWorkspace>( undefined );
	private readonly _endPoint: string
		= '/workspace';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	private _defaultSettings: WorkspaceSettings = {
		primaryColor: COLOR.PRIMARY,
		locale: APP_CONSTANT.LOCALE,
		timezone: APP_CONSTANT.TIMEZONE,
		dateFormat: APP_CONSTANT.DATE_FORMAT,
		timeFormat: APP_CONSTANT.TIME_FORMAT,
		weekStart: APP_CONSTANT.WEEK_START,
		workingWeekdays: CONSTANT.WORKING_WEEKDAYS as any,
		cloudStorage: CONSTANT.CLOUD_STORAGE,
	};

	// get storedWorkspace(): IWorkspace { return this._storedWorkspace; }
	// set storedWorkspace( workspace: IWorkspace ) {
	// 	this._storedWorkspace = workspace;

	// 	this._storedWorkspaceChange$.next( this._storedWorkspace );
	// }

	// get storedWorkspaceChange$(): BehaviorSubject<IWorkspace> { return this._storedWorkspaceChange$; }

	get defaultSettings(): WorkspaceSettings {
		return this._defaultSettings;
	}

	// get storedWorkspaceInitChange$(): Observable<IWorkspaceAccess> {
	// 	return this.setStoredWorkspaceInitChange$.pipe( filter( ( workspace: IWorkspaceAccess ) => !!workspace ) );
	// }

	/**
	 * @constructor
	 * @param {WGCCloudStorageConfig} _cloudStorageConfig
	 * @param {DateTimeConfig} _dateTimeConfig
	 * @param {Injector} _injector
	 * @param {WebSocketService} _webSocketService
	 * @param {AppearanceService} _appearanceService
	 * @param {WorkspaceService} _workspaceService
	 */
	constructor(
		@Optional() @Inject( WGC_CLOUD_STORAGE_CONFIG )
		private _cloudStorageConfig: WGCCloudStorageConfig,
		@Optional() @Inject( DATE_TIME_CONFIG )
		private _dateTimeConfig: DateTimeConfig,
		private _injector: Injector,
		private _webSocketService: WebSocketService,
		private _appearanceService: AppearanceService,
		private _workspaceService: WorkspaceService
	) {}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public getDetail( id: string ): Observable<IWorkspace> {
		return this._apiService.call( `${this._endPoint}/detail/${id}` );
	}

	/**
	 * @param {IWorkspace} workspace
	 * @return {Observable}
	 */
	public update( workspace: IWorkspace ): Observable<void> {
		return new Observable( ( observer: Observer<void> ) => {
			this._apiService
			.call( `${this._endPoint}/update`, 'PUT', workspace )
			.subscribe({
				next: () => {
					this._workspaceService.storedWorkspace = workspace;

					observer.next();
				},
				error	: observer.error.bind( observer ),
				complete: observer.complete.bind( observer ),
			});
		} );
	}

	/**
	 * @param {WorkspaceSettings} settings
	 * @return {void}
	 */
	public applySettings( settings: WorkspaceSettings ) {
		return;
		settings = _.defaultsDeep( settings, this._defaultSettings );

		// Cloud storages
		if ( _.has( settings, 'cloudStorage' ) ) {
			this._cloudStorageConfig.googleDrive
				= settings.cloudStorage.googleDrive;
			this._cloudStorageConfig.dropbox
				= settings.cloudStorage.dropbox;
			this._cloudStorageConfig.oneDrive
				= settings.cloudStorage.oneDrive;
		}

		// Date & Time formats
		if ( _.has( settings, 'dateFormat' ) ) this._dateTimeConfig.dateFormat = settings.dateFormat;
		if ( _.has( settings, 'timeFormat' ) ) this._dateTimeConfig.timeFormat = settings.timeFormat;
		if ( _.has( settings, 'weekStart' ) ) this._dateTimeConfig.weekStart = settings.weekStart;

		// Appearance
		if ( _.has( settings, 'primaryColor' ) ) this._appearanceService.setPrimaryColor( settings.primaryColor );

		// Timezone
		if ( _.has( settings, 'timezone' ) ) moment.tz.setDefault( this._dateTimeConfig.timezone = settings.timezone );

		// Locale
		// if ( _.has( settings, 'locale' ) ) this._appConfig.locale = this._localeService.locale = settings.locale;
	}

	/**
	 * @return {void}
	 */
	public clearSettings() {
		return;
		// Cloud storages
		this._cloudStorageConfig.googleDrive = true;
		this._cloudStorageConfig.dropbox = true;
		this._cloudStorageConfig.oneDrive = true;

		// Date & Time formats
		this._dateTimeConfig.dateFormat = APP_CONSTANT.DATE_FORMAT;
		this._dateTimeConfig.timeFormat = APP_CONSTANT.TIME_FORMAT;
		this._dateTimeConfig.weekStart = APP_CONSTANT.WEEK_START;

		// Appearance
		this._appearanceService.setPrimaryColor( null );

		// Timezone
		moment.tz.setDefault(
			this._dateTimeConfig.timezone = APP_CONSTANT.TIMEZONE
		);

		// Locale
		// this._appConfig.locale = this._localeService.locale = APP_CONSTANT.LOCALE;
	}

	/**
	 * @return {void}
	 */
	public switchWorkspace() {
		const accountService: AccountService
			= this._injector.get( AccountService );
		const authService: AuthService
			= this._injector.get( AuthService );
		const pageService: PageService
			= this._injector.get( PageService );
		const router: Router
			= this._injector.get( Router );
		const userService: UserService
			= this._injector.get( UserService );
		const storageService: StorageService
			= this._injector.get( StorageService );

		authService.setStoredAuth({
			accountID: accountService.storedAccount.email,
			accountToken: authService.getStoredAuth()?.accountToken,
		});

		storageService.removeLocal( AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY );
		pageService.setCurrentURL( null );
		userService.clearStoredUser();
		this._workspaceService.clearStoredWorkspace();
		this._webSocketService.disconnect();

		router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);
	}

}
