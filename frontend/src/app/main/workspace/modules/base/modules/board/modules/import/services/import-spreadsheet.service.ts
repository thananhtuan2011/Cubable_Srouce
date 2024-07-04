import {
	Injectable,
	inject
} from '@angular/core';
import XLSX from 'xlsx';
import _ from 'lodash';

import {
	CUBGoogleDriveFile
} from '@cub/material/file-picker';
import {
	CUBToastService
} from '@cub/material/toast';

import {
	InfoSheet
} from '../interfaces';
import {
	IMPORT_MAX_ROWS
} from '../resources';

type AOA = any[][];
@Injectable()
export class ImportSpreadsheetsService {
	protected workbook: XLSX.WorkBook;

	private _toastService: CUBToastService
		= inject( CUBToastService );
	private _worker: Worker;

	/**
	 * @param {CUBGoogleDriveFile} file
	 * @return {Promise<InfoSheet>}
	 */
	public async readFile(
		file: CUBGoogleDriveFile
	): Promise<InfoSheet> {
		return new Promise(
			( resolve: any, reject: any ) => {
				if (
					typeof Worker === 'undefined'
				) return;

				this._worker
					= new Worker(
						new URL( './workers/import-spreadsheet.worker.ts', import.meta.url ),
						{
							type: 'module',
						}
					);

				this._worker.onmessage = (
					e: {
						data: {
							workbook: XLSX.WorkBook;
							data: InfoSheet;
							error: ProgressEvent<FileReader>;
						};
					}
				) => {
					if (
						_.has( e.data, 'error' )
						|| e.data.error
					) {
						this
						._toastService
						.danger(
							'BASE.BOARD.IMPORT.MESSAGE.UPLOAD_FILE_FAILED'
						);

						reject( e.data.error );
						return;
					}

					this.workbook
						= e.data.workbook;

					resolve(
						e.data.data
					);
				};

				this._worker.postMessage({
					file,
				});

				this._worker.onerror = (
					error: any
				) => {
					this
					._toastService
					.danger(
						'BASE.BOARD.IMPORT.MESSAGE.UPLOAD_FILE_FAILED'
					);

					reject( error );
				};
			}
		);
	};

	/**
	 * @return {void}
	 */
	public destroyWorker() {
		if (
			!this._worker
		) return;

		this._worker.terminate();
	}

	/***
	* @param {string} sheetName
	* @return {Promise<InfoSheet>}
	*/
	public getCurrentSheet(
		sheetName: string
	): Promise<InfoSheet> {
		return new Promise((resolve: any, _reject: any) => {

			const records: AOA = this._getRecords(sheetName);

			const totalRows: number
				= records.length;

			const isError: boolean
				= totalRows > IMPORT_MAX_ROWS || totalRows === 0;

			resolve({
				isError,
				totalRows,
				records,
				isHasTitle: false,
				headers : records[0],
				sheets: this.workbook.SheetNames,
				currentSheet: sheetName,
			});
		});
	}

	/**
	 * @param {string} workSheetName
	 * @return {AOA}
	 */
	private _getRecords(workSheetName: string): AOA{
		const records: AOA
			= (
				XLSX.utils.sheet_to_json(
					this.workbook.Sheets[workSheetName],
					{ header: 1, blankrows: false }
				) as AOA
			);

		//* Remove empty columns
		const nonEmptyColumns: number[]
			= _.reduce(records[0],
				(acc: number[], _item: any, colIndex: number) => {
					const isColumnNonEmpty: any
						= _.some(records, (row: any) => row[colIndex] !== '');
					if (isColumnNonEmpty) {
						acc.push(colIndex);
					}
					return acc;
				}, []
			);

		//* Filter non-empty columns
		const filteredRecords: AOA =
			_.map(records, (row: any[]) =>
				_.filter(row, (_item: any, colIndex: number) =>
					_.includes(nonEmptyColumns, colIndex)
				));

		return filteredRecords;
	}
};
