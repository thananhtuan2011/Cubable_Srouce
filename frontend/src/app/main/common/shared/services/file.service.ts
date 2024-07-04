import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HASH } from '@environments/hash';

import { ApiService, ApiHeaders, StorageService } from '@core';

import { WGCIFile, WGCIFileService, openFile, openNewWindow } from '@wgc/wgc-file-picker';

@Injectable()
export class FileService implements WGCIFileService {

	private _endPoint: string = '/shared/file';
	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _headers: ApiHeaders = { Authorization: `Bearer ${HASH.SHARED_TOKEN}` };

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 * @param {StorageService} _storageService
	 */
	constructor( private _apiService: ApiService, private _storageService: StorageService ) {}

	/**
	 * @param {FileList} files
	 * @param {ObjectType=} options
	 * @param {boolean=} useAuthorizedKey
	 * @return {Observable}
	 */
	public upload( files: FileList | File[], options?: ObjectType, useAuthorizedKey: boolean = true ): Observable<any> {
		this._headers.Authorization
			= `Bearer ${useAuthorizedKey && this._storageService.getCookie( HASH.AUTHORIZED_KEY )?.workspaceToken || HASH.SHARED_TOKEN}`;

		// @ts-ignore
		return this._apiService.upload( `${this._endPoint}/upload`, files, this._headers, options );
	}

	/**
	 * @param {ObjectType[]} files - data to download
	 * @return {Observable}
	 */
	public download( files: ObjectType[] ): Observable<any> {
		return this._apiService.call( `${this._endPoint}/download`, 'POST', { files }, this._headers );
	}

	/**
	 * @param {WGCIFile} file
	 * @return {void}
	 */
	public openFile( file: WGCIFile ) {
		openFile( file ) || this.downloadLocalFile( file );
	}

	/**
	 * @param {WGCIFile} file
	 * @return {void}
	 */
	public downloadLocalFile( file: WGCIFile ) {
		this.download([ file ]).subscribe( openNewWindow );
	}

}
