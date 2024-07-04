import {
	IUpgradePlan, IPeriodType, IRecomendPlan,
	IContactInformation, ICurrentPlan
} from './subscription.interface';

export interface ISelectedPlan extends IUpgradePlan {
	billingPeriod: IPeriodType;
}

export interface IDialogPaymentData extends IContactInformation {
	isRenewPlan: boolean;
	currentMaxDiscountPercent: number;
	currentPlan: ICurrentPlan;
	selectedPlan: ISelectedPlan;
	recommendPlan: IRecomendPlan;
	upgradablePlans: IUpgradePlan[];
}
