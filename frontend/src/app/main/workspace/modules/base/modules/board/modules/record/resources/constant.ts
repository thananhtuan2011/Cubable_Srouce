/* eslint-disable no-shadow */
export enum DisplayType {
	SPREADSHEET	= 1,
	CALENDAR = 2,
	CHART = 3,
	KANBAN = 4,
}

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	DISPLAY_ICON: {
		[ DisplayType.SPREADSHEET ]	: 'table',
	},
} as const;
