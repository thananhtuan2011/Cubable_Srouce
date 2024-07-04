import { Component, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import _ from 'lodash';

import { EqualValidators, Unsubscriber } from '@core';

import { WGCIDialogRef, WGC_DIALOG_DATA, WGC_DIALOG_REF } from '@wgc/wgc-dialog';

import { IAccount } from '@main/account/interfaces';
import { AccountService } from '@main/account/services';
import { CONSTANT as AUTH_CONSTANT } from '@main/auth/resources';

@Unsubscriber()
@Component({
	selector		: 'dialog-change-password',
	templateUrl		: '../templates/dialog-change-password.pug',
	host			: { class: 'dialog-change-password' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class DialogChangePasswordComponent {

	public isSubmitting: boolean;
	public currentPassword: string = '';
	public newPassword: string = '';
	public confirmNewPassword: string;
	public changePasswordForm: FormGroup;

	/**
	 * @constructor
	 * @param {Dialog} dialogRef
	 * @param {ObjectType} data
	 * @param {AccountService} _accountService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {FormBuilder} _fb
	 * @param {Router} _router
	 */
	constructor(
		@Inject( WGC_DIALOG_REF ) public dialogRef: WGCIDialogRef,
		@Inject( WGC_DIALOG_DATA ) public data: { account: IAccount },
		private _accountService: AccountService,
		private _cdRef: ChangeDetectorRef,
		private _fb: FormBuilder,
		private _router: Router
	) {
		this.changePasswordForm = this._fb.group(
			{
				currentPassword: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
				newPassword: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
				confirmNewPassword: [
					undefined,
					[ Validators.required, Validators.maxLength( 255 ) ],
				],
			},
			{
				validators: [
					EqualValidators.disallowSimilarPassword,
					EqualValidators.matchPassword,
				],
			}
		);
	}

	/**
	 * @return {void}
	 */
	public save() {
		this.isSubmitting = true;

		this._accountService
		.updateAccount( this.data.account, this.currentPassword, this.newPassword )
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} )
		)
		.subscribe( () => this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_OUT ]) );
	}

}
