/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-shadow */
// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	PATH: {
		MAIN	: 'base',
		DETAIL	: 'detail',
		NOTIFICATION: 'notification',
	},
} as const;

export enum DisplayType {
	TABLE = 1,
	GRID = 2
}
