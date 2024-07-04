import { Injectable, Inject, inject } from '@angular/core';
import _ from 'lodash';

import { HASH } from '@environments/hash';

import {
	ApiService,
	CookieDataChange,
	SERVER_CONFIG,
	STORAGE_CONFIG,
	ServerConfig,
	StorageConfig,
	StorageService,
	untilCmpDestroyed
} from '@core';

import { IError } from '@error/interfaces';
import { ErrorService } from '@error/services';

import { IAuth } from '@main/auth/interfaces';

@Injectable({ providedIn: 'root' })
export class WorkspaceApiService extends ApiService {

	private readonly _storageService: StorageService = inject( StorageService );
	private readonly _errorService: ErrorService = inject( ErrorService );

	/**
	 * @constructor
	 * @param {ServerConfig} serverConfig
	 * @param {StorageConfig} storageConfig
	 */
	constructor(
		@Inject( SERVER_CONFIG ) public serverConfig: ServerConfig,
		@Inject( STORAGE_CONFIG ) public storageConfig: StorageConfig
	) {
		super( serverConfig, storageConfig );

		this._initSubscription();

		const data: IAuth =
			this._storageService.getCookie( HASH.AUTHORIZED_KEY );

		if ( _.isStrictEmpty( data ) ) return;

		this.setAccessToken( data.workspaceToken );
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this.errorCatcher$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(
			( err: IError ) => this._errorService.errorCatcher$.next( err ) );

		this._storageService.cookieChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( data: CookieDataChange ) => {
			if ( data.key !== HASH.AUTHORIZED_KEY &&
				!( _.isNull( data.key ) &&
				_.isNull( data.data ) ) ) return;

			const authData: IAuth = data.data;

			this.setAccessToken( authData?.workspaceToken );
		} );
	}

}
