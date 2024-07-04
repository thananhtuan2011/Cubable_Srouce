import { appVersion } from '@environments/version'; // src/environemts/version.ts

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const ENVIRONMENT = {
	PRODUCTION						: false,
	HMR								: false,
	SIGN_UP_FEATURE					: true,
	SERVER_API_URL					: 'http://office113.ddns.net:8130',
	SERVER_WEBSOCKET_URL			: 'http://office113.ddns.net:8132',
	FILE_SYSTEM_API_URL				: 'http://office113.ddns.net:8133',
	APP_URL							: 'http://localhost:8000',
	APP_NAME						: 'Cubable',
	APP_TITLE						: 'Make future now',
	APP_LOGO						: 'assets/images/logos/logo.svg',
	APP_LOGO_HORIZONTAL				: 'assets/images/logos/logo-horizontal.svg',
	APP_LOGO_VERTICAL				: 'assets/images/logos/logo-vertical.png',
	APP_VERSION						: appVersion,
	FCM_SUBSCRIPTION_ENDPOINT		: null,
	FCM_PUBLIC_KEY					: null,
	DROPBOX_APP_KEY					: 'pjag1grtnuetp52',
	RECAPTCHA_SITE_KEY				: '6Ld556EmAAAAAOqWMC8ycJfvDAgwPinGh-0RgxAH',
	GOOGLE_CLIENT_ID				: '957817874945-n7dp0rq2o3har8pen7sq9qmpmal4n0r6.apps.googleusercontent.com',
	MICROSOFT_CLIENT_ID				: '02d372c1-6b82-41cb-a787-520e9c51c2b2',
} as const;
