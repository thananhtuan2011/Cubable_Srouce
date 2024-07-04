// eslint-disable-next-line @typescript-eslint/typedef,@typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export const ICON_TYPE = {
	LIKE		: 1,
	HEART		: 2,
	HEART_EYES	: 3,
	WOW			: 4,
	LAUGH		: 5,
	SAD			: 6,
	ANGRY		: 7,
} as const;

// eslint-disable-next-line @typescript-eslint/typedef,@typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export const ASSETS_ICON = {
	[ ICON_TYPE.LIKE ]		: 'assets/images/icons/reactions/reaction-like.png',
	[ ICON_TYPE.HEART ]		: 'assets/images/icons/reactions/reaction-love.png',
	[ ICON_TYPE.HEART_EYES ]: 'assets/images/icons/reactions/reaction-heart-eyes.png',
	[ ICON_TYPE.WOW ] 		: 'assets/images/icons/reactions/reaction-wow.png',
	[ ICON_TYPE.LAUGH ]		: 'assets/images/icons/reactions/reaction-laugh.png',
	[ ICON_TYPE.SAD ]		: 'assets/images/icons/reactions/reaction-sad.png',
	[ ICON_TYPE.ANGRY ]		: 'assets/images/icons/reactions/reaction-angry.png',
} as const;

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const ASSETS_ICON_SHADOW = {
	[ ICON_TYPE.LIKE ]		: 'assets/images/icons/reactions/reaction-like-shadow.png',
	[ ICON_TYPE.HEART ]		: 'assets/images/icons/reactions/reaction-love-shadow.png',
	[ ICON_TYPE.HEART_EYES ]: 'assets/images/icons/reactions/reaction-heart-eyes-shadow.png',
	[ ICON_TYPE.WOW ] 		: 'assets/images/icons/reactions/reaction-wow-shadow.png',
	[ ICON_TYPE.LAUGH ]		: 'assets/images/icons/reactions/reaction-laugh-shadow.png',
	[ ICON_TYPE.SAD ]		: 'assets/images/icons/reactions/reaction-sad-shadow.png',
	[ ICON_TYPE.ANGRY ]		: 'assets/images/icons/reactions/reaction-angry-shadow.png',
} as const;
