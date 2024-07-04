import {
	Component,
	ChangeDetectionStrategy,
	OnInit
} from '@angular/core';
import {
	Router
} from '@angular/router';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

@Unsubscriber()
@Component({
	selector		: 'signout',
	template		: '',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SignOutComponent implements OnInit {

	/**
	 * @constructor
	 * @param {Router} _router
	 * @param {AuthService} _authService
	 */
	constructor(
		private _router: Router,
		private _authService: AuthService
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._authService
		.signout()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => this._router.navigate([ CONSTANT.PATH.SIGN_IN ]),
		});
	}

}
