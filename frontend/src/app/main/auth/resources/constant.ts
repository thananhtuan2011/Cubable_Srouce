// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	RECENT_WORKSPACE_STORE_KEY	: 'RECENT_WORKSPACE',
	PATH: {
		RESET_PASSWORD		: 'reset-password',
		SET_PASSWORD		: 'set-password',
		SIGN_IN				: 'sign-in',
		SIGN_OUT			: 'sign-out',
		SIGNUP				: 'sign-up',
		ACCEPT_INVITATION	: 'accept-invitation',
	},
	SCREEN_TYPE: {
		SIGNIN			: 'signin',
		SIGNUP			: 'signup',
		RESET_PASSWORD	: 'reset-password',
	},
	GOOGLE_SCOPE	: 'profile email',
	MICROSOFT_SCOPE	: 'User.Read',
} as const;
