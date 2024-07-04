import {
	Injectable,
	inject
} from '@angular/core';
import {
	BehaviorSubject,
	Observable,
	Observer
} from 'rxjs';
import _ from 'lodash';

import {
	ApiParams
} from '@core';

import {
	IAccount
} from '../interfaces';

import {
	AccountApiService
} from './account-api.service';

@Injectable({ providedIn: 'root' })
export class AccountService {

	private readonly _storedAccountChange$: BehaviorSubject<IAccount>
		= new BehaviorSubject<IAccount>( undefined );
	private readonly _endPoint: string
		= '/account';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	private _storedAccount: IAccount;

	get storedAccount(): IAccount {
		return this._storedAccount;
	}
	set storedAccount( account: IAccount ) {
		this._storedAccount = account;

		this.storedAccountChange$.next( this._storedAccount );
	}

	get storedAccountChange$(): BehaviorSubject<IAccount> {
		return this._storedAccountChange$;
	}

	/**
	 * @param {IAccount=} account
	 * @param {string=} currentPassword
	 * @param {string=} newPassword
	 * @return {Observable}
	 */
	public updateAccount(
		account?: IAccount,
		currentPassword?: string,
		newPassword?: string
	): Observable<IAccount> {
		return new Observable(
			( observer: Observer<IAccount> ) => {
				const params: ApiParams = {};

				if ( account ) params.avatar = account.avatar;
				if ( account ) params.name = account.name;
				if ( account ) params.logoutSetting = account.logoutSetting;
				if ( currentPassword && newPassword ) {
					params.currentPassword = _.aesEncrypt( currentPassword );
					params.newPassword = _.aesEncrypt( newPassword );
				}

				this._apiService
				.call( `${this._endPoint}/update`, 'PUT', params )
				.subscribe({
					next: ( result: IAccount ) => {
						this.storedAccount = {
							...this.storedAccount,
							...result,
						};

						observer.next( result );
					},
					error	: observer.error.bind( observer ),
					complete: observer.complete.bind( observer ),
				});
			}
		);
	}

	/**
	 * @return {Observable}
	 */
	public delete(): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/logout`,
			'DELETE'
		);
	}

	/**
	 * @return {void}
	 */
	public clearStoredAccount() {
		this.storedAccount = undefined;
	}

}
