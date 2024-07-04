import {
	inject,
	Injectable
} from '@angular/core';
import _ from 'lodash';

import {
	CUBToastService
} from '@cub/material/toast';

import {
	InfoSheet
} from '../interfaces';

@Injectable()
export class ImportCSVService {

	protected records: string[] | string[][];

	private _toastService: CUBToastService
		= inject( CUBToastService );
	private _worker: Worker;

	/**
	 * @param {File} file
	 * @return {Promise<InfoSheet>}
	 */
	public readFile(
		file: File
	): Promise<InfoSheet> {
		return new Promise((resolve: any, reject: any) => {
			if (
				typeof Worker === 'undefined'
			) return;

			this._worker
				= new Worker(
					new URL( './workers/import-csv.worker.ts', import.meta.url ),
					{
						type: 'module',
					}
				);

			this._worker.onmessage = (
				e: {
					data: {
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

				resolve( e.data.data );
			};

			this._worker.postMessage({
				file,
				records: this.records,
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
		});
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

	// TODO can remove because one sheet only
	/***
	* @param {string} sheetName
	 * @return {Promise<InfoSheet>}
	*/
	public getCurrentSheet(
		sheetName: string
	): Promise<InfoSheet> {
		return new Promise((resolve: any, _reject: any) => {
			// Phân tích từng dòng của CSV để cắt ra các ô
			this.records = this.records.map((items: any) => {
				const cells: string[] = [];
				let currentCell: string = '';
				let insideQuotes: boolean = false;

				for (const item of items) {
					const char: string = item;
					if (char === '"') {
						insideQuotes = !insideQuotes;
					} else if (char === ',' && !insideQuotes) {
						cells.push(currentCell.trim());
						currentCell = '';
					} else {
						currentCell += char;
					}
				}
				cells.push(currentCell.trim()); // Thêm ô cuối cùng vào mảng
				return cells;
			});

			// Lọc các bản ghi không trống
			this.records = this.records.filter(
				(row: any) => row.length > 0
					&& row.split( ',' ).some(
						(cell: any) => cell !== null && cell !== undefined && cell !== ''
					)
			);

			resolve({
				isHasTitle: true,
				totalRows: this.records.length - 1,
				headers : this.records[ 0 ],
				records: this.records.slice(1),
				sheets: [sheetName],
				currentSheet: sheetName,
			});
		});
	}

};
