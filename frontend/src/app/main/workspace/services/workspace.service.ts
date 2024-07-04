import {
	Inject,
	Injectable,
	Injector,
	inject,
	Optional
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
	filter,
	tap,
	take
} from 'rxjs/operators';
import _ from 'lodash';

import {
	APP_CONFIG,
	AppConfig,
	PageService,
	ServiceWorkerService,
	WebSocketOptions,
	WebSocketService
} from '@core';

import { ENVIRONMENT } from '@environments/environment';

import { AccountApiService } from '@main/account/services';
import { IAuth } from '@main/auth/interfaces';
import { AuthService } from '@main/auth/services/auth.service';
import { CONSTANT as BASE_CONSTANT } from '@main/workspace/modules/base/resources';
import { CONSTANT as WORKSPACE_CONSTANT } from '@main/workspace/resources';

import { CONSTANT as APP_CONSTANT } from '@resources';

import { IWorkspace, IWorkspaceAccess, IWorkspaceCreate } from '../interfaces';
import { UserService } from '../modules/settings/modules/workspace/modules/user-system/modules/user/services';
import { IUserData } from '../modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

export interface ICheckAvailableIDResponse {
	isAvailable: boolean;
	suggestedID: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

	public readonly setStoredWorkspaceInitChange$:
	BehaviorSubject<IWorkspaceAccess>
		= new BehaviorSubject<IWorkspaceAccess>( undefined );

	private readonly _endPoint: string = '/workspace';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	private _storedWorkspace: IWorkspace;
	private _storedWorkspaceChange$: BehaviorSubject<IWorkspace>
		= new BehaviorSubject<IWorkspace>( undefined );

	get storedWorkspace(): IWorkspace { return this._storedWorkspace; }
	set storedWorkspace( workspace: IWorkspace ) {
		this._storedWorkspace = workspace;

		this._storedWorkspaceChange$.next( this._storedWorkspace );
	}

	get storedWorkspaceChange$(): BehaviorSubject<IWorkspace> {
		return this._storedWorkspaceChange$;
	}

	get storedWorkspaceInitChange$(): Observable<IWorkspaceAccess> {
		return this.setStoredWorkspaceInitChange$
		.pipe( filter( ( workspace: IWorkspaceAccess ) => !!workspace ) );
	}

	/**
	 * @constructor
	 * @param {AppConfig} _appConfig
	 * @param {Injector} _injector
	 * @param {WebSocketService} _webSocketService
	 * @param {ServiceWorkerService} _serviceWorkerService
	 */
	constructor(
		@Optional() @Inject( APP_CONFIG ) private _appConfig: AppConfig,
		private _pageService: PageService,
		private _injector: Injector,
		private _webSocketService: WebSocketService,
		private _serviceWorkerService: ServiceWorkerService
	) {}

	/**
	 * @return {Observable}
	 */
	public get(): Observable<IWorkspace[]> {
		return this._apiService.call( `${this._endPoint}/list`, 'GET' );
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public checkAvailableID(
		id: string
	): Observable<ICheckAvailableIDResponse> {
		return this._apiService.call(
			`${this._endPoint}/check-available/${id}`
		);
	}

	/**
	 * @param {IWorkspace} workspace
	 * @return {Observable}
	 */
	public create( workspace: IWorkspace ): Observable<IWorkspaceCreate> {
		return this._apiService.call( `${this._endPoint}/create`, 'POST', workspace );
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public access( id: string ): Observable<IWorkspaceAccess> {
		return this._apiService
		.call( `${this._endPoint}/access/${id}`, 'GET' )
		.pipe( tap( ( workspaceAccess: IWorkspaceAccess ) => {
			const authService: AuthService = this._injector.get( AuthService );
			const userService: UserService = this._injector.get( UserService );
			const workspace: IWorkspace = workspaceAccess.workspace;

			userService.storedUser = {
				user: workspaceAccess.user,
			} as IUserData;
			this.storedWorkspace = workspace;

			this._pageService.getCurrentURL() === APP_CONSTANT.MAIN_PATH
				&& this._pageService.setCurrentURL(
					// eslint-disable-next-line max-len
					`${WORKSPACE_CONSTANT.PATH.MAIN}/${id}/${BASE_CONSTANT.PATH.MAIN}`
				);

			const auth: IAuth = authService.getStoredAuth();

			authService.setStoredAuth({
				workspaceID		: workspaceAccess.workspace.id,
				workspaceToken	: workspaceAccess.workspaceToken,
				accountID		: auth.accountID,
				accountToken	: auth.accountToken,
			});

			this._webSocketService
			.connect({
				namespace: workspace.id,
				options: {
					reconnectionAttempts: 10,
					reconnectionDelayMax: 60000,
					transports			: [ 'websocket' ],
					path				: '/realtime',
				} as WebSocketOptions,
			})
			.pipe( take( 1 ) )
			.subscribe();

			// Todo: tạm thời đề trong này để có workspaceID
			// Todo: chờ BE update lại notification helper
			this._serviceWorkerService
			.enablePushNotification({
				onNotificationClicked: (
					{ notification }: { notification: NotificationOptions }
				) => window.open(
					// eslint-disable-next-line max-len
					`${ENVIRONMENT.APP_URL}/${WORKSPACE_CONSTANT.PATH.MAIN}/${id}/notification?notificationID=${notification?.data?.notificationID}`
				),
			});

			this.setStoredWorkspaceInitChange$.next( workspaceAccess );

			// Temp comment
			// const onboardingService: OnboardingService = this._injector.get( OnboardingService );

			// onboardingService.check().subscribe();
		} ) );
	}

	/**
	 * @return {void}
	 */
	public clearStoredWorkspace() {
		this.storedWorkspace = undefined;

		this.resetMainPath();
		this.setStoredWorkspaceInitChange$.next( undefined );
	}

	/**
	 * @return {void}
	 */
	public resetMainPath() {
		this._appConfig.mainPath = APP_CONSTANT.MAIN_PATH;
	}

}
