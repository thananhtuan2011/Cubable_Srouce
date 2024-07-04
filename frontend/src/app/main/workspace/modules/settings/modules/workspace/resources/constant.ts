// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	WORKING_WEEKDAYS: [ 0, 1, 1, 1, 1, 1, 0 ],
	CLOUD_STORAGE: {
		googleDrive: true,
		dropbox: true,
		oneDrive: true,
	},
	PATH: {
		ACCESS_WORKSPACE: 'access-workspace',
	},
	TEMPLATE_KEY: {
		USER_SYSTEM: '0',
	},
} as const;
