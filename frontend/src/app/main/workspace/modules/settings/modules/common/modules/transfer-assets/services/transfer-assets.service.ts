import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import _ from 'lodash';

import { ApiService } from '@core';

import { ITransferAssets, ITransferData } from '../interfaces';
import { CONSTANT } from '../resources';

type _IAssetType = typeof CONSTANT.ASSET_TYPE;

export type IAssetType = _IAssetType[ keyof _IAssetType ];

export interface ITransfer extends ITransferData {
	recheckPassword: string;
}

@Injectable()
export class TransferAssetsService {

	private _endPoint: string = '/api/transfer/ownership';

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor( private _apiService: ApiService ) {}

	/**
	 * @param {IAssetType[]} assetType
	 * @param {string[]} userIDs
	 * @return {Observable}
	 */
	public getTransferAssets( assetType: IAssetType[], userIDs?: string[] ): Observable<ITransferAssets> {
		return this._apiService.call( `${this._endPoint}/list-assets`, 'POST', userIDs ? { assetType, userIDs } : { assetType } );
	}

	/**
	 * @param {IAssetType[]} assetType
	 * @return {Observable}
	 */
	public getTransferOwnAssets( assetType: IAssetType[] ): Observable<ITransferAssets> {
		return this._apiService.call( `${this._endPoint}/list-own-assets`, 'GET', { assetType } );
	}

	/**
	 * @param {ITransfer} data
	 * @return {Observable}
	 */
	public transferAssets( data: ITransfer ): Observable<void> {
		data.recheckPassword = _.aesEncrypt( data.recheckPassword );

		return this._apiService.call( `${this._endPoint}/transfer-assets`, 'PUT', data );
	}

	/**
	 * @param {ITransfer} data
	 * @return {Observable}
	 */
	public transferOwnAssets( data: ITransfer ): Observable<void> {
		data.recheckPassword = _.aesEncrypt( data.recheckPassword );

		return this._apiService.call( `${this._endPoint}/transfer-own-assets`, 'PUT', data );
	}

}
