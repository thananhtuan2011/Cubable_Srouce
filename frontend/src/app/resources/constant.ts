import { CONSTANT as _CONSTANT } from 'angular-core';

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	..._CONSTANT,
	LOCALE					: 'vi',
	USE_VIRTUAL_SCROLL_WITH	: 20, // 20 items
	MAIN_PATH				: 'sign-in',
	API_HEADER				: { FORCE_RELOAD: { 'Force-Reload': 'true' } }, // eslint-disable-line @typescript-eslint/naming-convention
	MAIL_HELPER				: 'help@cubable.com',
	// HOTLINE				: '+84-79-311-9339',
	HOTLINE					: '079 311 9339',
	SOCKET_TOPIC: {
		NOTIFICATION			: 'notification',
		NOTIFICATION_HIGHLIGHT	: 'notification_highlight',
		BOARD_DUPLICATE_PROCESS	: 'board_duplicate_process',
	},
	DIALOG_UNIQ_KEY: {
		AUTOMATION		: 'automation',
		BOARD_INFO		: 'board_info',
		BOARD_ITEM		: 'board_item',
		CONFIRM_PASSWORD: 'confirm_password',
		DOCUMENT		: 'document',
		EXPORT_DOCUMENT	: 'export_document',
		FORM_FIELD		: 'form_field',
		PERMISSION		: 'permission',
		VALIDATION		: 'validation',
		INVITE_USER		: 'invite_user',
		TEAM			: 'team',
	},
} as const;
