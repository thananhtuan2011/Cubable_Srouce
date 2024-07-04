import {
	ULID
} from 'ulidx';

import {
	DateTrigger,
	RowTrigger
} from './trigger.interface';

export type DateArrivesSetting = {
	boardID: ULID;
	row: RowTrigger;
	dateSelection: DateTrigger;
};
