import { appVersion } from '@environments/version'; // src/environemts/version.ts

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const ENVIRONMENT = {
	PRODUCTION						: true,
	HMR								: false,
	SIGN_UP_FEATURE					: true,
	SERVER_API_URL					: 'https://api.8aday.com',
	SERVER_WEBSOCKET_URL			: 'https://socket.8aday.com',
	FILE_SYSTEM_API_URL				: 'https://files.8aday.com',
	APP_URL							: 'https://line1.8aday.com',
	APP_DOMAIN						: 'line1.8aday.com',
	APP_NAME						: 'Cubable',
	APP_TITLE						: 'Make future now',
	APP_LOGO						: 'assets/images/logos/logo.svg',
	APP_LOGO_HORIZONTAL				: 'assets/images/logos/logo-horizontal.svg',
	APP_LOGO_VERTICAL				: 'assets/images/logos/logo-vertical.png',
	APP_VERSION						: appVersion,
	FCM_SUBSCRIPTION_ENDPOINT		: '/fcm/subscription',
	FCM_PUBLIC_KEY					: 'BMoupV-KBa4kANw5kE646NJTFN6jwyciRTah5_wpSwBWTKPSF3U3aZtRg9gp9x5BH-IzVpe3CGnDnVGqb-jcw5M',
	DROPBOX_APP_KEY					: 'pjag1grtnuetp52',
	RECAPTCHA_SITE_KEY				: '6Ld556EmAAAAAOqWMC8ycJfvDAgwPinGh-0RgxAH',
	GOOGLE_CLIENT_ID				: '957817874945-n7dp0rq2o3har8pen7sq9qmpmal4n0r6.apps.googleusercontent.com',
	MICROSOFT_CLIENT_ID				: '02d372c1-6b82-41cb-a787-520e9c51c2b2',
} as const;
