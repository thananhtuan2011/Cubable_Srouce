import { CONSTANT as SETTINGS_CONSTANT } from '../modules/settings/resources';

const MAIN_PATH: 'account' = 'account';

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	PATH: {
		MAIN: MAIN_PATH,
		ACCOUNT_SETTINGS: `${MAIN_PATH}/${SETTINGS_CONSTANT.PATH.MAIN}`,
	},
	LOGOUT_SETTING_TYPE		: { NEVER: 1, BY_TIME: 2, ANOTHER_DEVICE: 3, CLOSE_BROWSER: 4 },
	LOGOUT_SETTING_CUSTOM_TIME	: { DAYS: 'days', WEEKS: 'weeks', MONTHS: 'months' },
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const ROLE = {
	STAFF		: 1,
	LEADER		: 2,
	MANAGER		: 3,
	C_LEVEL		: 4,
	OWNER		: 5,
	FREELANCER	: 6,
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const SIZE = {
	'2_5'		: 1,
	'6_10'		: 2,
	'11_25'		: 3,
	'26_50'		: 4,
	'51_200'	: 5,
	'201_500'	: 6,
	// eslint-disable-next-line quote-props
	'500'		: 7,
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const TEAM = {
	MARKETING		: 1,
	HR_LEGAL		: 2,
	SALES_ACCOUNT	: 3,
	FINANCE			: 4,
	CUSTOMER_SERVICE: 5,
	OPERATION		: 6,
	PRODUCT			: 7,
	ENGINEERING		: 8,
	IT_SUPPORT		: 9,
	MANUFACTURING	: 10,
	PERSONAL_USE	: 11,
	OTHER			: 12,
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const INDUSTRY = {
	MARKETING_ADVERTISING	: 1,
	ENTERTAINMENT			: 2,
	EDUCATION				: 3,
	HUMAN_RESOURCES			: 4,
	FINANCIAL_SERVICES		: 5,
	ACCOUNTING				: 6,
	LAW						: 7,
	TECHNOLOGY				: 8,
	HOSPITALITY				: 9,
	RETAIL					: 10,
	REAL_ESTATE				: 11,
	F_B						: 12,
	PERSONAL_USE			: 13,
	OTHER					: 14,
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const NEEDING = {
	PROJECT						: 1,
	TASK						: 2,
	CONTENT						: 3,
	MEDIA_PERFORMANCE			: 4,
	CUSTOMER_RELATIONSHIP		: 5,
	ADMISSION					: 6,
	STUDENT						: 7,
	CLASS						: 8,
	EDUCATION_QUALITY			: 9,
	EMPLOYEE_INFORMATION		: 10,
	LEAVE						: 11,
	SALARY						: 12,
	EDUCATION_MANAGEMENT		: 13,
	REVENUE_EXPENDITURE			: 14,
	BUDGET						: 15,
	ACCOUNT_PAYABLE_RECEIVABLE	: 16,
	CONSULTING_SCHEDULE			: 17,
	CONSULTANT_PERFORMANCE		: 18,
	WAREHOUSE					: 19,
	SALES						: 20,
	KPI							: 21,
	OTHER						: 22,
} as const;
