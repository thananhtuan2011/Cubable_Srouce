import {
	ULID
} from 'ulidx';

import {
	FieldExtra
} from '@main/common/field/interfaces';
import {
	Config,
	Row
} from '@main/common/spreadsheet/components';
import {
	Column
} from '@main/common/spreadsheet/components/sub-classes/column';

export interface FieldSupport extends FieldExtra{
	isMatch: boolean;
}

export type DialogPreviewContext = {
	boardID: string;
	fields: FieldExtra[];
	fieldsExcel: IFieldsExcel[];
	dataPreview: DataPreview;
};

export interface IFieldsExcel {
	totalRows: number;
	totalError: number;
	isMatch: boolean;
	isAuto: boolean;
	fieldCurrent: {
		value: string;
		index: number;
	};
	fieldTarget: {
		value: string;
		index: number;
	};
	field: FieldExtra | null;
};

export interface DataPreview {
	config: Config;
	columns: Column[];
	rows: Row[];
};

export type ManualOption = {
	id: ULID;
	name: string;
	selected?: boolean;
	added?: boolean;
};

export type ManualMappingOption = Record<string, ULID>;
