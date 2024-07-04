import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import _ from 'lodash';

import { ApiService } from '@core';

import { IUser, IUserData } from '../../workspace/modules/user-system/modules/user/interfaces';
import { UserService } from '../../workspace/modules/user-system/modules/user/services';

@Injectable()
export class UserPreferencesService {

	private _endPoint: string = '/api/user-preferences';

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor( private _apiService: ApiService, private _userService: UserService ) {}

	// TODO check xem storedUser có change không
	/**
	 * @param {IUser} user
	 * @return {Observable}
	 */
	public updateUserSettings( user: IUser ): Observable<void> {
		return new Observable( ( observer: Observer<void> ) => {
			this._apiService
			.call( `${this._endPoint}/settings`, 'PUT', { ...user.settings } )
			.subscribe({
				next: () => {
					const storedUser: IUserData = this._userService.storedUser;

					this._userService.storedUser = { ...storedUser, user: { ...storedUser.user, settings: { ...storedUser.user.settings, ...user.settings } } };

					observer.next();
				},
				error	: observer.error.bind( observer ),
				complete: observer.complete.bind( observer ),
			});
		} );
	}

}
