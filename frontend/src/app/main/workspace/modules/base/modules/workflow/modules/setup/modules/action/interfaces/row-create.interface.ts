import {
	ULID
} from 'ulidx';

import {
	FieldValueSetting
} from './change-value.interface';

export type CreateRowSetting = {
	boardID: ULID;
	fields: FieldValueSetting[];
};
