import {
	ULID
} from 'ulidx';

import {
	ComparisonType
} from '../resources';

export type AdvanceData = {
	compareType?: ComparisonType;
	metadata?: ObjectType;

	// Auto
	fieldID?: ULID;

	// workflow filter condition
	targetField?: {
		blockID: ULID; // TODO can change attr common => targetID
		boardID: ULID; // TODO can change attr common => targetID
		fieldID: ULID;
	};
};
