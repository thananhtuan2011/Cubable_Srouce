import {
	Component, Injector, OnInit,
	ChangeDetectionStrategy, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import { UnloadChecker } from '@main/unload-checker';

import { LocaleService, Unsubscriber, untilCmpDestroyed } from '@core';

import { WGCDialogService } from '@wgc/wgc-dialog';
import { WGCMenuComponent } from '@wgc/wgc-menu';

import { CONSTANT } from '@main/account/resources';
import { CONSTANT as AUTH_CONSTANT } from '@main/auth/resources';

import { IAccount } from '../../../interfaces';
import { AccountService } from '../../../services';

import { DialogChangePasswordComponent } from '../components';

@Unsubscriber()
@Component({
	selector		: 'security',
	templateUrl		: '../templates/security.pug',
	styleUrls		: [ '../styles/security.scss' ],
	host			: { class: 'security' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SecurityComponent extends UnloadChecker implements OnInit {

	@ViewChild( 'logoutSettingMenu' ) public logoutSettingMenu: WGCMenuComponent;

	public readonly LOGOUT_SETTING_TYPE: typeof CONSTANT.LOGOUT_SETTING_TYPE = CONSTANT.LOGOUT_SETTING_TYPE;
	public readonly LOGOUT_SETTING_CUSTOM_TIME: typeof CONSTANT.LOGOUT_SETTING_CUSTOM_TIME = CONSTANT.LOGOUT_SETTING_CUSTOM_TIME;

	public isSaving: boolean;
	public isLogoutSettingOpened: boolean;
	public logoutSettingLoaded: boolean;
	public isLogoutSettingChanged: boolean;
	public logoutSettingSelected: string;
	public baseOnTimeSelected: string;
	public logoutSettingLabel: string;
	public logoutSettingOptions: string[];
	public baseOnTimeOptions: string[];
	public account: IAccount = {} as IAccount;
	public accountClone: IAccount = {} as IAccount;

	/**
	 * @constructor
	 * @param {Injector} injector
	 * @param {Router} router
	 * @param {AccountService} _accountService
	 * @param {WGCDialogService} _wgcDialogService
	 * @param {TranslateService} _translateService
	 * @param {LocaleService} _localeService
	 */
	constructor(
		public injector: Injector,
		protected router: Router,
		private _accountService: AccountService,
		private _wgcDialogService: WGCDialogService,
		private _translateService: TranslateService,
		private _localeService: LocaleService
	) {
		super();

		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.logoutSettingOptions = [
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.NEVER' ),
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.BY_TIME' ),
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.ANOTHER_DEVICE' ),
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.CLOSE_BROWSER' ),
			];
			this.baseOnTimeOptions = [
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.EVERY_DAY' ),
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.EVERY_WEEK' ),
				this._translateService.instant( 'ACCOUNT.SETTINGS.LABEL.EVERY_MONTH' ),
			];
		} );
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
			this.account = account ? _.cloneDeep( account ) : this.account;
			this.accountClone = _.cloneDeep( this.account );

			if ( this.account.email ) {
				this.account.logoutSetting && this.account.logoutSetting.type
					? this.logoutSettingSelected = this.logoutSettingOptions[ this.account.logoutSetting.type - 1 ]
					: this.logoutSettingSelected = this.logoutSettingOptions[ 0 ];

				this.logoutSettingLabel = this.logoutSettingSelected;

				if ( this.account.logoutSetting && this.account.logoutSetting.params ) {
					let index: number;

					if ( this.account.logoutSetting.params.periodFormat === this.LOGOUT_SETTING_CUSTOM_TIME.DAYS ) index = 0;
					else if ( this.account.logoutSetting.params.periodFormat === this.LOGOUT_SETTING_CUSTOM_TIME.WEEKS ) index = 1;
					else index = 2;

					this.baseOnTimeSelected = this.baseOnTimeOptions[ index ];
				}

				if ( this.baseOnTimeSelected ) this.logoutSettingLabel = this.logoutSettingSelected + ' - ' + this.baseOnTimeSelected;

				this.logoutSettingLoaded = true;
			}

			this.cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	public save() {
		this.isSaving = true;

		this._accountService.updateAccount( this.account )
		.pipe(
			finalize( () => {
				this.isSaving = false;

				this.cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( _account: IAccount ) => {
			this.router.navigate([ AUTH_CONSTANT.PATH.SIGN_OUT ]);
		} );
	}

	/**
	 * @return {void}
	 */
	public cancel() {}

	/**
	 * @return {void}
	 */
	public openDialogChangePassword() {
		this._wgcDialogService.open(
			DialogChangePasswordComponent,
			{
				width	: '550px',
				data	: { account: this.account },
			}
		);
	}

	/**
	 * @param {string} _logoutSettingSelected
	 * @param {number} _logoutSettingType
	 * @return {void}
	 */
	public selectLogoutSettingOption( _logoutSettingSelected: string, _logoutSettingType: number ) {
		this.accountClone.logoutSetting
			? this.accountClone.logoutSetting.type === _logoutSettingType
				? this.isLogoutSettingChanged = false
				: this.isLogoutSettingChanged = true
			: _logoutSettingType === this.LOGOUT_SETTING_TYPE.NEVER
				? this.isLogoutSettingChanged = false
				: this.isLogoutSettingChanged = true;


		this.logoutSettingSelected = _logoutSettingSelected;
		this.logoutSettingLabel = this.logoutSettingSelected;
		this.baseOnTimeSelected = null;

		this.cdRef.markForCheck();

		if ( !this.account.logoutSetting ) this.account.logoutSetting = { type: 1 };

		this.account.logoutSetting.type = _logoutSettingType;
		this.account.logoutSetting.params = null;
	}

	/**
	 * @param {string} _baseOnTimeSelected
	 * @param {string} _baseOnTimeType
	 * @return {void}
	 */
	public selectCustomTimeOption( _baseOnTimeSelected: string, _baseOnTimeType: string ) {
		this.selectLogoutSettingOption( this.logoutSettingOptions[ 1 ], this.LOGOUT_SETTING_TYPE.BY_TIME );

		this.accountClone.logoutSetting
		&& this.accountClone.logoutSetting.params
		&& this.accountClone.logoutSetting.params.periodFormat === _baseOnTimeType
			? this.isLogoutSettingChanged = false
			: this.isLogoutSettingChanged = true;

		this.baseOnTimeSelected = _baseOnTimeSelected;
		this.logoutSettingLabel = this.logoutSettingSelected + ' - ' + this.baseOnTimeSelected;

		switch( _baseOnTimeType ) {
			case this.LOGOUT_SETTING_CUSTOM_TIME.DAYS: {
				this.account.logoutSetting.params = {
					periodCount: 1, periodFormat: this.LOGOUT_SETTING_CUSTOM_TIME.DAYS, periodTime: this._getSpecificTime(),
				};
				break;
			}
			case this.LOGOUT_SETTING_CUSTOM_TIME.WEEKS: {
				this.account.logoutSetting.params = {
					periodCount: 1, periodFormat: this.LOGOUT_SETTING_CUSTOM_TIME.WEEKS, periodTime: this._getSpecificTime(),
				};
				break;
			}
			case this.LOGOUT_SETTING_CUSTOM_TIME.MONTHS: {
				this.account.logoutSetting.params = {
					periodCount: 1, periodFormat: CONSTANT.LOGOUT_SETTING_CUSTOM_TIME.MONTHS, periodTime: this._getSpecificTime(),
				};
				break;
			}
		}

		this.logoutSettingMenu?.close();
		this.cdRef.markForCheck();
	}

	/**
	 * @return {Moment}
	 */
	private _getSpecificTime(): Moment {
		return moment().set( 'hour', 4 ).set( 'minute', 0 ).set( 'second', 0 ).set( 'millisecond', 0 );
	}

}
