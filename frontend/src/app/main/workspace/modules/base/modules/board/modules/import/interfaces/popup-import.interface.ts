import {
	ULID
} from 'ulidx';

import {
	FieldExtra
} from '@main/common/field/interfaces';
import {
	Row
} from '@main/common/spreadsheet/components';

export type PopupImportContext = {
	boardID: string;
};

export type InfoSheet = {
	isHasTitle: boolean;
	totalRows: number;
	headers: string[];
	records: Row[];
	sheets: string[];
	isError: boolean;
	currentSheet: string;
};

export type ImportFields = {
	importID: ULID;
	totalRecords: number;
	fields: FieldExtra[];
	boardID: ULID;
};

export type ImportRecords = {
	boardID: ULID;
	importID: ULID;
	index: number;
	records: ItemRecord[];
};

export type ItemRecord = {
	cells: Row[];
};

export type ImportCancel = {
	boardID: ULID;
	importID: ULID;
};

export type ResponseSocketImport = {
	importedRecords: number;
};

export type IValidDate = {
	field: FieldExtra;
	columns: {
		value: string;
		header: string;
		isError: boolean;
	}[];
};
