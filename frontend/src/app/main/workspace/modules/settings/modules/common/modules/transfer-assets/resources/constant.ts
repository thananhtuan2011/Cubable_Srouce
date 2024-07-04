// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	ASSET_TYPE: {
		COLLECTION	: 1,
		DOCUMENT	: 2,
	},
	ASSET_FIELD: {
		NAME		: '1',
		OWNER		: '2',
		STATUS		: '3',
		CREATED_AT	: '4',
		UPDATED_AT	: '5',
	},
	ASSET_COLLECTION_FIELD: {
		BOARDS			: '6',
		PUBLIC_BOARDS	: '7',
		SUB_OWNERS		: '8',
	},
	ASSET_DOCUMENT_FIELD: {
		SUB_PAGES: '6',
		SHARED_TO: '7',
	},
	ASSET_FIELD_STATUS: {
		ARCHIVE: 1,
		UNARCHIVE: 2,
	},
} as const;
