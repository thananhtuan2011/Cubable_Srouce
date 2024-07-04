import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ApiService, LocaleService } from '@core';

import {
	IDownloadBilling, ISubscription, ITransaction,
	IUsageCollection, ICheckout, IInvoice,
	IPeriodType, IReceipt, IInspectCheckout
} from '../interfaces';
import { CONSTANT } from '../resources';

export interface ICheckoutParams {
	isGetInvoice: boolean;
	planID: number;
	billingPeriod: IPeriodType;
	receiptAddress: IReceipt;
	redirectConfigs: {
		backURL: string;
		successURL: string;
		failureURL: string;
	};
	isSaveInformation?: boolean;
	invoiceAddress?: IInvoice;
}

export interface IUpdateInformation {
	receiptAddress?: IReceipt;
	invoiceAddress?: IInvoice;
}

@Injectable()
export class SubscriptionService {

	public PLAN_NAME: ObjectType<string>;
	public BILLING_PERIOD: ObjectType<{ period: string; prefix: string }>;

	private _endPoint: string = '/subscription';

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 * @param {LocaleService} _localeService
	 * @param {TranslateService} _translateService
	 */
	constructor(
		private _apiService: ApiService,
		private _localeService: LocaleService,
		private _translateService: TranslateService
	) {
		this._localeService.localeChange$.subscribe( () => {
			this.PLAN_NAME = {
				[ CONSTANT.PLAN.FREE ]		: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.FREE' ),
				[ CONSTANT.PLAN.STARTER ]	: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.STARTER' ),
				[ CONSTANT.PLAN.BUSINESS ]	: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.BUSINESS' ),
				[ CONSTANT.PLAN.PREMIUM ]	: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.PREMIUM' ),
				[ CONSTANT.PLAN.ENTERPRISE ]: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.ENTERPRISE' ),
			};

			this.BILLING_PERIOD = {
				[ CONSTANT.PERIOD_TYPE.MONTHLY ]: {
					period: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.MONTHLY' ),
					prefix: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.MONTHLY_PREFIX' ),
				},
				[ CONSTANT.PERIOD_TYPE.YEARLY ]: {
					period: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.YEARLY' ),
					prefix: this._translateService.instant( 'SETTINGS.WORKSPACE.SUBSCRIPTION.LABEL.YEARLY_PREFIX' ),
				},
			};
		} );
	}

	/**
	 * @return {Observable}
	 */
	public detail(): Observable<ISubscription> {
		return this._apiService.call( `${this._endPoint}/detail`, 'GET' );
	}

	/**
	 * @return {Observable}
	 */
	public getTransactions(): Observable<ITransaction[]> {
		return this._apiService .call( `${this._endPoint}/transactions`, 'GET' );
	}

	/**
	 * @return {Observable}
	 */
	public getCollections(): Observable<IUsageCollection[]> {
		return this._apiService .call( `${this._endPoint}/collections`, 'GET' );
	}

	/**
	 * @param {string} paymentID
	 * @return {Observable}
	 */
	public downloadReceipt( paymentID: string ): Observable<IDownloadBilling> {
		return this._apiService.call( `${this._endPoint}/download-receipt`, 'GET', { paymentID } );
	}

	/**
	 * @param {string} paymentID
	 * @return {Observable}
	 */
	public downloadInvoice( paymentID: string ): Observable<IDownloadBilling> {
		return this._apiService.call( `${this._endPoint}/download-invoice`, 'GET', { paymentID } );
	}

	/**
	 * @return {Observable}
	 * @param {ICheckoutParams} data
	 */
	public checkout( data: ICheckoutParams ): Observable<ICheckout> {
		return this._apiService.call( `${this._endPoint}/checkout`, 'POST', data );
	}

	/**
	 * @return {Observable}
	 * @param {Pick<ICheckoutParams, 'planID' | 'billingPeriod'>} data
	 */
	public inspectCheckout( data: Pick<ICheckoutParams, 'planID' | 'billingPeriod'> ): Observable<IInspectCheckout> {
		return this._apiService.call( `${this._endPoint}/inspect-checkout`, 'POST', data );
	}

	/**
	 * @return {Observable}
	 * @param {IUpdateInformation} data
	 */
	public updateInformation( data: IUpdateInformation ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/addresses`, 'PUT', data );
	}

}
