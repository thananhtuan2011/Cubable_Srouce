import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core';

import { IUserFieldValue, IUpdateUserProfile } from '../interfaces';

@Injectable()

export class ProfileService {

	private _endPoint: string = '/api/user-profile';

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor(private _apiService: ApiService) {}

	/**
	 * @return {Observable}
	 */
	public getUserProfileInfo(): Observable<IUserFieldValue[]> {
		return this._apiService.call( `${this._endPoint}/info`, 'GET' );
	}

	/**
	 * @param {IUpdateUserProfile} data
	 * @returns {Observable}
	 */
	public updateUserProfile( data: IUpdateUserProfile ): Observable<IUserFieldValue[]> {
		return this._apiService.call( `${this._endPoint}/update`, 'PUT', data );
	}

}
