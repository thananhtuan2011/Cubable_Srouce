import * as XLSX from 'xlsx';
import _ from 'lodash';

import {
	CUBGoogleDriveFile
} from '@cub/material/file-picker';

import {
	IMPORT_MAX_ROWS
} from '../../resources';

type AOA = any[][];
addEventListener(
	'message',
	async ( e: { data: { file: CUBGoogleDriveFile } } ) => {
		fetch(
			`https://docs.google.com/spreadsheets/d/${e.data.file.id}/export?format=xlsx`
		)
		.then( ( response: any ) => response.blob() )
		.then(
			( blobResponse: Blob ) => {
				const reader: FileReader = new FileReader();

				reader.onload = async (
					f: ProgressEvent<FileReader>
				) => {
					const dataArray: Uint8Array
						= new Uint8Array(
							f.target.result as ArrayBuffer
						);

					const workbook: XLSX.WorkBook
						= XLSX.read(
							dataArray,
							{ type: 'array' }
						);

					const indexValidSheet: number | undefined
						= _checkValidSheet( workbook );

					const workSheetName: string
						= workbook.SheetNames[indexValidSheet|| 0];

					const records: AOA
						= _getRecords(
							workbook,
							workSheetName
						);

					const totalRows: number
						= records.length;

					postMessage({
						workbook,
						data: {
							records,
							totalRows,
							isError: indexValidSheet === undefined
								|| totalRows === 0,
							isHasTitle: false,
							headers: records[0],
							sheets:  workbook.SheetNames,
							currentSheet: indexValidSheet === undefined
								? workbook.SheetNames[0]
								: workSheetName,
						},
					});
				};

				reader.readAsArrayBuffer(
					blobResponse
				);
			}
		)
		.catch(
			( error: any ) => {
				postMessage({ error });
			}
		);
	}
);
const _checkValidSheet = (
	workbook: XLSX.WorkBook
): number | undefined => {

	const workSheets: string[] = workbook.SheetNames;

	for (
		const [index, workSheet] of workSheets.entries()
	) {
		const records: AOA
			= _getRecords( workbook, workSheet );

		const totalRows: number = records.length;

		if (
			totalRows <= IMPORT_MAX_ROWS
			&& totalRows !== 0
		) {
			return index;
		}

	}

	return undefined;
};

const _getRecords = (
	workbook: XLSX.WorkBook,
	workSheetName: string
): AOA => {
	const records: AOA
		= (
			XLSX.utils.sheet_to_json(
				workbook.Sheets[workSheetName],
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
};
