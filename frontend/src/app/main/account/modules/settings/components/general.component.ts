import {
	Component, Injector, OnInit,
	ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import _ from 'lodash';

import { UnloadChecker } from '@main/unload-checker';

import { Unsubscriber, untilCmpDestroyed } from '@core';

import { IAccount } from '../../../interfaces';
import { AccountService } from '../../../services';

@Unsubscriber()
@Component({
	selector		: 'general',
	templateUrl		: '../templates/general.pug',
	styleUrls		: [ '../styles/general.scss' ],
	host			: { class: 'general' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class GeneralComponent extends UnloadChecker implements OnInit {

	public isInfoChanged: boolean;
	public isSubmitting: boolean;
	public generalForm: FormGroup;
	public account: IAccount = {} as IAccount;

	private _bkAccount: IAccount;

	/**
	 * @constructor
	 * @param {Injector} injector
	 * @param {Router} router
	 * @param {FormBuilder} _fb
	 * @param {AccountService} _accountService
	 */
	constructor(
		public injector: Injector,
		protected router: Router,
		private _fb: FormBuilder,
		private _accountService: AccountService
	) {
		super();

		this.generalForm = this._fb.group({
			name: [
				undefined,
				[ Validators.required, Validators.maxLength( 255 ) ],
			],
		});
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		super.ngOnInit();

		this._accountService
		.storedAccountChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( account: IAccount ) => {
			this._bkAccount = _.cloneDeep( account );
			this.account = account ? _.cloneDeep( account ) : this.account;
		} );
	}

	/**
	 * @param {any} event
	 * @return {void}
	 */
	public updateAvatar( event: any ) {
		this.account.avatar = event.avatar;
		this.isInfoChanged = true;

		this.markAsChanged();
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	public updateName( event: string ) {
		if ( !event || this.account.name === event ) return;

		this.account.name = event;
		this.isInfoChanged = true;

		this.markAsChanged();
	}

	/**
	 * @return {void}
	 */
	public save() {
		this.isSubmitting = true;

		this.unmarkAsChanged();

		this._accountService
		.updateAccount( this.account )
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this.cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({ next: () => this.isInfoChanged = false });
	}

	/**
	 * @return {void}
	 */
	public cancel() {
		this.unmarkAsChanged();

		this.isInfoChanged = false;
		this.account = _.cloneDeep( this._bkAccount );
	}

}
