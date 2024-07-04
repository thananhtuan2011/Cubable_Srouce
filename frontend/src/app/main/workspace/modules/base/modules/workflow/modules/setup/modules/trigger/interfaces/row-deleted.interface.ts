import {
	ULID
} from 'ulidx';

import {
	RowTrigger
} from './trigger.interface';

export type RowDeleteSetting = {
	boardID: ULID;
	row: RowTrigger;
};
