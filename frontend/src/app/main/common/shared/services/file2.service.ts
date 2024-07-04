import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '@environments/environment';
import { HASH } from '@environments/hash';

import {
	ApiService,
	StorageService
} from '@core';

import {
	CUBIFileService,
	CUBUploadFileResponse
} from '@cub/material/file-picker';

@Injectable()
export class File2Service implements CUBIFileService {

	protected readonly apiService: ApiService
		= inject( ApiService );
	protected readonly storageService: StorageService
		= inject( StorageService );

	/**
	 * @constructor
	 */
	constructor() {
		this.apiService.setBaseURL( ENVIRONMENT.FILE_SYSTEM_API_URL );
	}

	/**
	 * @param {File[]} files
	 * @param {string=} authorizedKey
	 * @param {ObjectType=} options
	 * @return {Observable}
	 */
	public upload(
		files: File[],
		authorizedKey?: string,
		options?: ObjectType
	): Observable<CUBUploadFileResponse> {
		authorizedKey ||= this.storageService
		.getCookie( HASH.AUTHORIZED_KEY )?.workspaceToken;

		return this.apiService.upload(
			'/upload',
			files,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			{ Authorization: `Bearer ${authorizedKey}` },
			options
		);
	}

}
