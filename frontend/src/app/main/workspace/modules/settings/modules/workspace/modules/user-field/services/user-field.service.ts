import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core';

import { IUserField, IUserFieldUpdate } from '../interfaces';

@Injectable()
export class UserFieldService {

	private _endPoint: string = '/api/user-field';

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor( private _apiService: ApiService ) {}

	/**
	 * @return {Observable}
	 */
	public get(): Observable<IUserField[]> {
		return this._apiService.call( `${this._endPoint}/list`, 'GET' );
	}

	/**
	 * @param {IUserFieldUpdate} data
	 * @return {Observable}
	 */
	public update( data: IUserFieldUpdate ): Observable<IUserField[]> {
		return this._apiService.call( `${this._endPoint}/bulk-update`, 'PUT', data );
	}

}
