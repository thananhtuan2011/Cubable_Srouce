import {
	Injectable
} from '@angular/core';
import {
	saveAs
} from 'file-saver';
import Excel, {
	Font
} from 'exceljs';
import _ from 'lodash';

import {
	AttachmentFile,
	DataType,
	DropdownOption,
	FormulaConfigDateFormat,
	FormulaResultFormatType,
	FormulaValueParams,
	NumberDecimalPlaces,
	PeopleOption,
	ReferenceItemsByView
} from '@main/common/field/interfaces';
import {
	Column,
	Row
} from '@main/common/spreadsheet/components';
import {
	FormulaCalculatedType
} from '@main/common/field/resources';
import {
	Field,
	parseDateString
} from '@main/common/field/objects';
import {
	PHONE_COUNTRIES
} from '@resources';

@Injectable()
export class ExportFileService {
	private _errorKey: string = 'Error explanation';
	private _errorValue: string = '<Dữ liệu không hợp lệ>';
	private _unName: string = 'Chưa đặt tên';

	/**
	 * @param {string} fileName
	 * @param {Row[]=} selectedRows
	 * @param {Column[]=} columnExport
	 * @return {void}
	 */
	public exportXlsx(
		fileName: string,
		selectedRows?: Row[],
		columnExport?: Column[]
	) {
		const workbook: Excel.Workbook
			= new Excel.Workbook();
  		const worksheet: Excel.Worksheet
			= workbook.addWorksheet();

		const sheetColumns: Excel.Column[] = _.map(
			columnExport,
			( { id, field, width }: Column ): Excel.Column => {
				let numFmt: string;
				let font: Font;

				switch ( field.dataType ) {
					case DataType.Currency:
					case DataType.Number:
						numFmt = this._generateNumFmt(
							field.extra.params?.currency,
							field.extra.params?.decimalPlaces
						);
						break;
					case DataType.Progress:
						numFmt = '0%';
						break;
					default:
						width = 260;
						break;
				}
				return {
					key: id,
					header: field.name,
					width:  ( width * 0.75 ) / 12, // px to em
					style: {
						numFmt,
						font,
					},
				} as Excel.Column;
			}
		);

		if (
			_.some(
				selectedRows,
				(row: Row) => !_.isStrictEmpty( row.warning )
			)
		) {
			sheetColumns.push(
				{
					header: this._errorKey,
					key: this._errorKey,
				} as Excel.Column
			);
		}

		worksheet.columns = sheetColumns;

		_.forEach(
			selectedRows,
			( { data, content }: Row ) => {
				const obj: Record<Column[ 'id' ], any>
					= {};

				_.forEach(
					columnExport,
					( { id, field }: Column ) => {

						if(
							content
							&& content[ id ]
						) {
							obj[ id ]
								= content[ id ];
							return;
						}

						if (
							_.isNil( data[ id ] )
						) {
							obj[ id ] = '';
							return;
						}

						obj[ id ] = this._transDataExport(
							field,
							field.dataType,
							data[ id ]
						);
					}
				);

				const row: Excel.Row = worksheet.addRow( obj );

				_.forEach(
					columnExport,
					( { field }: Column, index: number) => {
						const dataRow: Excel.Cell = row.getCell(index + 1);

						if (
							content &&
							obj[ columnExport[ index ].id ]
								=== content[ columnExport[ index ].id ]
							||
							_.some(
								data[ columnExport[ index ].id ]?.selected,
								{ error: true }
							)

						) {
							dataRow.style = {
								fill: {
									type: 'pattern',
									pattern: 'solid',
									fgColor: { argb: 'FFFF0000' },
								},
								font: {
									color: {
										argb: 'FFFFFFFF',
									},
								},
								border: {
									top: { style: 'thin' },
									left: { style: 'thin' },
									bottom: { style: 'thin' },
									right: { style: 'thin' },
								},
							};

							const errorCell: Excel.Cell
								= row.getCell(columnExport.length + 1);
							errorCell.value = this._errorValue;
						} else if (
							[
								DataType.Link,
								DataType.Email,
								DataType.Phone,
							].includes( field.dataType )
						) {
							dataRow.style = {
								font: {
									underline: true,
									color: { theme: 10 },
								},
							};
						}
					});
			}
		);

		workbook.xlsx
		.writeBuffer()
		.then(( buffer: Excel.Buffer ) => {
			saveAs(
				new Blob([ buffer ]),
				`${fileName}.xlsx`
			);
		});
	}

	/**
	 * @param {string=} currency
	 * @param {number=} decimalPlaces
	 * @return {string}
	 */
	private _generateNumFmt(
		currency?: string,
		decimalPlaces?: NumberDecimalPlaces
	): string {
		const currencyPrefix: string
			= currency ? `"${currency}"` : '';
		const decimalPart: string
		= decimalPlaces > 0
			? `.${'0'.padEnd( decimalPlaces, '0' )}`
			: '';

		return `${currencyPrefix}#,##0${decimalPart}`;
	}

	/**
	 * @param {string} field
	 * @param {DataType | FormulaCalculatedType} dataType
	 * @param {any} data
	 * @param {FormulaValueParams=} param
	 * @return {any}
	 */
	private _transDataExport(
		field: Field,
		dataType: DataType | FormulaCalculatedType,
		data: any,
		param?: FormulaValueParams
	): any {
		let dataExp: any;

		switch( dataType ) {
			case DataType.Checkbox:
				dataExp
					= _.upperCase( data );
				break;
			case DataType.Number:
			case DataType.Currency:
				dataExp = data;
				break;
			case DataType.Text:
			case DataType.Paragraph:
			case DataType.CreatedTime:
			case DataType.LastModifiedTime:
				dataExp
					= field.toString( data );
				break;
			case DataType.Date:
				dataExp = parseDateString(
					data,
					field.params?.format
						?? (
							param.resultFormatType
								=== FormulaResultFormatType.Date
								? param.resultFormatConfig?.format
								: ''
						),
					field.params?.timeFormat
						?? (
							param.resultFormatType
								=== FormulaResultFormatType.Date
								? (
									param.resultFormatConfig as
									FormulaConfigDateFormat
								)?.timeFormat
								: ''
						)
				);

				break;
			case DataType.Dropdown:
				dataExp =
					_.map(
						data.selected,
						( option: DropdownOption ) =>
							option.name
					).join( ', ' );
				break;
			case DataType.Link:
				dataExp =
					{
						text: data.text
							?? data.link,
						hyperlink:
							data.link.match( /^http(s)?/ )
								? data.link
								: `https://${data.link}`,
						tooltip: data.link,
					};
				break;
			case DataType.Attachment:
				dataExp =
					_.map(
						data,
						(file: AttachmentFile) => file.url
					).join( '\n' );
				break;
			case DataType.Email:
				dataExp =
					{
						text: data,
						hyperlink: `mailto:${data}`,
						tooltip: data,
					};
				break;
			case DataType.Phone:
				const phoneCountry: string = _.find(
					PHONE_COUNTRIES,
					{ code: data.countryCode }
				)?.dialCode;

				const phone: string
					= phoneCountry
						? `${phoneCountry}${data.phone}`
						: data.phone;

				dataExp = {
					text: phone,
					hyperlink: `tel:${phone}`,
					tooltip: phone,
				};
				break;
			case DataType.Formula:
				dataExp = this._transDataExport(
					field,
					data.calculated.resultType,
					data.calculated.data,
					data.params
				);
				break;
			case DataType.Reference:
				dataExp =
					_.map(
						data.selected,
						( item: ReferenceItemsByView ) =>
							item.data ?? this._unName
					).join( ', ' );
				break;
			case DataType.People:
			case DataType.CreatedBy:
			case DataType.LastModifiedBy:
				dataExp =
					_.map(
						data.selected,
						( user: PeopleOption ) => user.name
					).join( ', ' );
				break;
			case FormulaCalculatedType.CALCULATED_ARRAY:
				dataExp = JSON.stringify(
					data,
					null,
					2
				).replace(/,\n\s+/g, ', ')
				.replace(/\[\s+/g, '[ ')
				.replace(/\s+\]/g, ' ]');
				break;
			case FormulaCalculatedType.CALCULATED_NULL:
				dataExp = 'null';
				break;
			case FormulaCalculatedType.CALCULATED_UNDEFINED:
				dataExp = 'undefined';
				break;
			default:
				dataExp = data;
				break;
		}

		return dataExp;
	}
}
