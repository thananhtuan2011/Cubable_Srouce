import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CONSTANT } from '../resources';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGrantService {

	/**
	 * @constructor
	 * @param {Router} _router
	 * @param {AuthService} _authService
	 */
	constructor( private _router: Router, private _authService: AuthService ) {}

	/**
	 * @return {boolean}
	 */
	public canActivate(): boolean {
		const isAccountAccessed: boolean = this._authService.isAccountAccessed;

		if ( !isAccountAccessed ) {
			// this._authService.markLastPathBeforeSignOut(); // improve later
			this._router.navigate([ CONSTANT.PATH.SIGN_IN ]);
		}

		return isAccountAccessed;
	}

}
