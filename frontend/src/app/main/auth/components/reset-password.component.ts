import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Injector
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	EqualValidators,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CONSTANT as ERROR_CONSTANT
} from '@error/resources';
import {
	IError
} from '@error/interfaces';

import {
	IAccount,
	IResetPassword
} from '@main/account/interfaces';

import {
	REGEXP
} from '@resources';

import {
	CUBToastService
} from '@cub/material/toast';

import {
	IScreenType
} from '../interfaces';
import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

import {
	AuthBase
} from './auth-base';

interface IResetPasswordStep {
	email: number;
	otp: number;
	submit: number;
}

@Unsubscriber()
@Component({
	selector		: 'reset-password',
	templateUrl		: '../templates/reset-password.pug',
	styleUrls		: [ '../styles/auth.scss' ],
	host			: { class: 'auth reset-password' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent
	extends AuthBase<MapObjectValue<
		typeof ResetPasswordComponent.RESET_PASSWORD_STEP>> {

	public static readonly RESET_PASSWORD_STEP: IResetPasswordStep
		= { email: 1, otp: 2, submit: 3 };

	public readonly RESET_PASSWORD_STEP: IResetPasswordStep
		= ResetPasswordComponent.RESET_PASSWORD_STEP;
	public readonly SIGN_IN_PATH: typeof CONSTANT.PATH.SIGN_IN
		= CONSTANT.PATH.SIGN_IN;
	public readonly screenType: IScreenType
		= CONSTANT.SCREEN_TYPE.RESET_PASSWORD;

	public isEmailInvalid: boolean;
	public resetPasswordForm: FormGroup;

	/**
	 * @constructor
	 * @param {Injector} injector
	 * @param {FormBuilder} _fb
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {AuthService} _authService
	 */
	constructor(
		protected injector: Injector,
		private _fb: FormBuilder,
		private _cdRef: ChangeDetectorRef,
		private _authService: AuthService,
		private _toastService: CUBToastService
	) {
		super( injector );

		this.step
			= ResetPasswordComponent
			.RESET_PASSWORD_STEP.email;

		this.resetPasswordForm = this._fb.group({
			email: [
				undefined,
				[
					Validators.required,
					Validators.maxLength( 255 ),
					Validators.pattern( REGEXP.EMAIL ),
				],
			],
		});
	}

	/**
	 * @return {void}
	 */
	public resetPassword() {
		this.isSubmitting = true;

		this._authService
		.sendOTP(
			CONSTANT.SCREEN_TYPE.RESET_PASSWORD,
			this.account.email
		)
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => this.step
				= ResetPasswordComponent
				.RESET_PASSWORD_STEP.otp,
			error: ( error: IError ) => {
				if (
					error.error.key
						!== ERROR_CONSTANT.KEY.EMAIL_INCORRECT
				) return;

				this.isEmailInvalid = true;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {IResetPassword} accessData
	 * @return {void}
	 */
	public verifyComplete( accessData: IResetPassword ) {
		this.resetPasswordForm
			= this._fb.group(
				{
					newPassword: [
						undefined,
						[
							Validators.required,
							Validators.maxLength( 255 ),
							Validators.minLength( 1 ),
						],
					],
					confirmNewPassword: [
						undefined,
						[
							Validators.required,
							Validators.maxLength( 255 ),
							Validators.minLength( 1 ),
						],
					],
				},
				{
					validators: [ EqualValidators.matchPassword ],
				}
			);

		this.step
			= ResetPasswordComponent
			.RESET_PASSWORD_STEP.submit;
		this.token
			= accessData.resetPasswordToken;
		this.account
			= _.omit(
				accessData.account,
				'password'
			);
	}

	/**
	 * @return {void}
	 */
	public submitAccountInfo() {
		if ( !this.account || !this.token ) return;

		this.isSubmitting = true;

		this._authService
		.resetPassword(
			this.token,
			this.account as IAccount
		)
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._showToastSuccess();

				super.stateNavigate([ CONSTANT.PATH.SIGN_IN ]);
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _showToastSuccess() {
		this._toastService
		.success(
			'AUTH.MESSAGE.RESET_PASSWORD_SUCCESS',
			{
				duration: 3000,
			}
		);
	}

}
