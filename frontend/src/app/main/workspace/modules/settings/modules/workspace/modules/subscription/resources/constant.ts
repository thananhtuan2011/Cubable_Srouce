
// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	PATH: {
		PAYMENT_SUCCESS_PATH: 'payment-success',
		PAYMENT_FAIL_PATH	: 'payment-fail',
	},
	PERIOD_TYPE: { MONTHLY: 1, YEARLY: 2 },
	PLAN: {
		FREE		: 1,
		STARTER		: 2,
		BUSINESS	: 3,
		PREMIUM		: 4,
		ENTERPRISE	: 5,
	},
	ACTIVITY_LOG_PERIOD: {
		DAYS	: 1,
		MONTHS	: 2,
		YEARS	: 3,
	},
} as const;
