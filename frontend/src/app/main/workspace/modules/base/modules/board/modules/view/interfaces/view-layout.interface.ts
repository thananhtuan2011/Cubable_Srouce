import { ULID } from 'ulidx';

import { RowSize } from '@main/common/spreadsheet/components';

export type LayoutDataUpdate = {
	fields?: FieldLayoutDataUpdate[];
	records?: RecordLayoutDataUpdate[];
};

export type FieldLayoutDataUpdate = FieldLayoutConfig;
export type RecordLayoutDataUpdate = RecordLayoutConfig;

export type FieldLayoutConfig = LayoutConfig & {
	width?: number;
	isHidden?: boolean;
};

export type RecordLayoutConfig = LayoutConfig;

export type ViewLayout = {
	field?: {
		fields?: FieldLayoutConfig[];
		frozenIndex?: number;
	};
	record?: {
		records?: RecordLayoutConfig[];
		size?: RowSize;
	};
};

type LayoutConfig = {
	id: ULID;
	position?: number;
};
