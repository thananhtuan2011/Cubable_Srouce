import {
	DataType
} from '@main/common/field/interfaces';

export const IMPORT_MAX_ROWS: number = 10000;
export const LOADING_PERCENTAGE_DEFAULT: number = 75;
export const BATCH_SIZE_IMPORT: number = 250;
export const LIMIT_ITEMS: number = 200;
export const MAX_PAGE: number = 10;
export const reportName: string = 'Error Report';

export enum FileExtension {
	CSV = 'csv',
	XLSX = 'xlsx',
	SPREADSHEET = 'spreadsheet',
};

export const fieldTypeNotSupport: ReadonlySet<DataType> = new Set([
	DataType.Attachment,
	DataType.Formula,
	DataType.Lookup,
	DataType.LastModifiedBy,
	DataType.LastModifiedTime,
	DataType.CreatedBy,
	DataType.CreatedTime,
]);

