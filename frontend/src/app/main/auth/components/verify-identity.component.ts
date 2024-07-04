import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	Output,
	QueryList,
	ViewChildren
} from '@angular/core';
import {
	Observable
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';
import {
	IError
} from '@error/interfaces';
import {
	CONSTANT as ERROR_CONSTANT
} from '@error/resources';
import {
	IAccount,
	IResetPassword
} from '@main/account/interfaces';
import {
	IScreenType,
	IVerifyData,
	IVerifySignUp
} from '../interfaces';
import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

@Unsubscriber()
@Component({
	selector		: 'verify-identity',
	templateUrl		: '../templates/verify-identity.pug',
	styleUrls		: [ '../styles/verify-identity.scss' ],
	host			: { class: 'verify-identity' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class VerifyIdentityComponent {

	@ViewChildren( CUBFormFieldInputDirective )
	public inputs: QueryList<CUBFormFieldInputDirective>;

	@Input() public screenType: IScreenType;
	@Input() public account: IAccount;

	@Output() public accessData: EventEmitter<string | IResetPassword>
		= new EventEmitter<string | IResetPassword>();

	protected isFormInvalid: boolean = true;
	protected isSubmitting: boolean;
	protected isOTPInvalid: boolean;
	protected isResendingOTP: boolean;
	protected countdown: number;

	private _interval: ReturnType<typeof setInterval>;

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {AuthService} _authService
	 */
	constructor(
		private _cdRef: ChangeDetectorRef,
		private _authService: AuthService
	) {
		this._startCountdown();
	}

	/**
	 * @return {void}
	 */
	public verifyOTP() {
		this.isSubmitting = true;

		const data: IVerifyData = {
			email: this.account.email,
			otp: this._getOTP() };
		const service: Observable<IVerifySignUp | IResetPassword>
		= this.screenType === CONSTANT.SCREEN_TYPE.SIGNUP
			? this._authService.verifySignUpOTP( data )
			: this._authService.verifyResetPasswordOTP( data );

		service
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( accessData: IVerifySignUp | IResetPassword ) => {
				if ( !accessData ) {
					this.isOTPInvalid = true;
					this._cdRef.markForCheck();
					return;
				}

				this.accessData.emit(
					this.screenType === CONSTANT.SCREEN_TYPE.SIGNUP
						? ( accessData as IVerifySignUp ).signupToken
						: accessData as IResetPassword
				);
			},
			error: (error: IError) => {
				if ( error?.error?.message ===
					ERROR_CONSTANT.MESSAGE.OTPS_MISMATCHED ) {
					this.isOTPInvalid = true;
				}
			},
		});
	}

	/**
	 * @return {void}
	 */
	public resendOTP() {
		this.isFormInvalid = this.isResendingOTP = true;
		this.isOTPInvalid = false;

		this._clearOTP();
		this._focusOTPInput( 0 );

		this._authService
		.sendOTP( this.screenType, this.account.email )
		.pipe(
			finalize( () => {
				this.isResendingOTP = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( this._startCountdown.bind( this ) );
	}

	/**
	 * @param {string} value
	 * @param {number} index
	 * @return {void}
	 */
	public onInput( value: string, index: number ) {
		if ( !value || !_.isFinite( Number( value ) ) ) return;

		// TODO change (input) => (valueControl) to set value to element by control
		const input: CUBFormFieldInputDirective
			= this.inputs.get( index );

		if ( input ) {
			input.writeValue( value );
		};

		this._validateOTP();
		this._focusOTPInput( index + 1 );
	}

	/**
	 * @param {KeyboardEvent} event
	 * @param {number} index
	 * @return {void}
	 */
	public onKeyUp( { key }: KeyboardEvent, index: number ) {
		switch ( key ) {
			case 'Backspace':
			case 'ArrowLeft':
				this._focusOTPInput( index - 1 );
				break;
			case 'ArrowRight':
				this._focusOTPInput( index + 1 );
				break;
		}

		this._validateOTP();
	}

	/**
	 * @param {ClipboardEvent} event
	 * @return {void}
	 */
	public onPasted( event: ClipboardEvent ) {
		event.preventDefault();

		const otp: string = event.clipboardData.getData( 'text/plain' );

		if ( !otp?.length ) return;

		this._setOTP( otp );
		this._validateOTP();
		this._focusOTPInput( otp.length );
	}

	/**
	 * @return {void}
	 */
	private _startCountdown() {
		this.countdown = 40;

		this._cdRef.markForCheck();

		this._interval = setInterval( () => {
			this.countdown--;

			this.countdown === 0 && this._endCountdown();

			this._cdRef.markForCheck();
		}, 1000 );
	}

	/**
	 * @return {void}
	 */
	private _endCountdown() {
		this.countdown = 0;

		clearInterval( this._interval );
	}

	/**
	 * @param {string} index
	 * @return {void}
	 */
	private _focusOTPInput( index: number ) {
		if ( index > 5 ) index = 5;
		else if ( index < 0 ) index = 0;

		this.inputs.get( index )?.focus();
	}

	/**
	 * @param {string} otp
	 * @return {void}
	 */
	private _setOTP( otp: string ) {
		_.forEach( otp, ( v: string, index: number ) => {
			const input: CUBFormFieldInputDirective = this.inputs.get( index );

			if ( !input ) return;

			input.writeValue(v);
		} );
	}

	/**
	 * @return {string}
	 */
	private _getOTP(): string {
		return _.chain( this.inputs.toArray() )
		.map( 'value' )
		.join( '' )
		.value();
	}

	/**
	 * @return {void}
	 */
	private _clearOTP() {
		_.forEach(
			this.inputs.toArray(),
			( input: CUBFormFieldInputDirective ) => input.clear() );
	}

	/**
	 * @return {void}
	 */
	private _validateOTP() {
		const otp: string = this._getOTP();

		this.isFormInvalid = otp.length !== 6
			|| _.some( otp, ( n: string ) => !_.isFinite( Number( n ) ) );
	}

}
