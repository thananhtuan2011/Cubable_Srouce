import { IUser } from '../../user-system/modules/user/interfaces';

import { CONSTANT } from '../resources';

export type IPeriodType = MapObjectValue<typeof CONSTANT.PERIOD_TYPE>;
export type IPlanType = MapObjectValue<typeof CONSTANT.PLAN>;
export type IActivityLogPeriodType = MapObjectValue<typeof CONSTANT.ACTIVITY_LOG_PERIOD>;

export interface ISubscription extends IContactInformation {
	currentMaxDiscountPercent: number;
	currentPlan: ICurrentPlan;
	recommendPlan: IRecomendPlan;
	planUsage: ILimitation;
	upgradablePlans: IUpgradePlan[];
}

export interface IContactInformation {
	invoiceDetails: IInvoice;
	receiptDetails: IReceipt;
}

export interface ICurrentPlan extends IPlan {
	canRenewPlan: boolean;
	customPrice: number;
	nextCycleDate: string;
	billingPeriod: IPeriodType;
}

export interface IUpgradePlan extends IPlan {}

export interface IRecomendPlan extends IPlan {}

export interface ILimitation {
	members: ILimitationData;
	collections: ILimitationData;
	boards: ILimitationData;
	rows: ILimitationData;
	monthlyAutomationRuns: ILimitationData;
	storageCapacity: ILimitationData & { memoryUnit: string };
	activitiesLogPeriod: ILimitationData & { type: IActivityLogPeriodType };
}

export interface ITransaction {
	amount: number;
	receiptNumber: string;
	date: string;
	transactionID: string;
	paymentID: string;
	currency: string;
}

export interface IUsageCollection {
	name: string;
	user: IUser;
	automations: ILimitationData;
	boards: ILimitationData;
	rows: ILimitationData;
}

export interface IInvoice extends ILocation {
	taxNumber?: number;
	companyName?: string;
}

export interface IReceipt extends ILocation {
	name?: string;
	email?: string;
}

export interface ICheckout {
	paymentLink: string;
}

export interface IDownloadBilling {
	pdfLink: string;
}

export interface IInspectCheckout {
	totalRemaining: number;
}

interface IPlan {
	planID: number;
	pricePerMonth: number;
	currency: string;
	limitation: ILimitation;
}

interface ILocation {
	cityID?: number;
	districtID?: number;
	wardID?: number;
	city?: string;
	district?: string;
	ward?: string;
	addressLine1?: string;
}

interface ILimitationData {
	limit: number;
	used: number;
}
