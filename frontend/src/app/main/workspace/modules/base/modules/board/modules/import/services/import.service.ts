import {
	inject,
	Injectable
} from '@angular/core';
import {
	untilCmpDestroyed
} from 'angular-core';
import {
	lastValueFrom
} from 'rxjs';
import {
	map
} from 'rxjs/operators';
import {
	ULID,
	ulid
} from 'ulidx';
import moment from 'moment';
import _ from 'lodash';

import {
	ACCENT_COLORS
} from '@cub/resources';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	CUBFile
} from '@cub/material/file-picker';

import {
	Column
} from '@main/common/spreadsheet/components/sub-classes/column';
import {
	DropdownField,
	Field,
	PeopleField,
	ReferenceField
} from '@main/common/field/objects';
import {
	DataType,
	DropdownData,
	DropdownOption,
	FieldExtra,
	PeopleData,
	ReferenceData,
	ReferenceItem,
	ReferenceRecord
} from '@main/common/field/interfaces';
import {
	Row,
	ROW_SIZES,
	RowCellContent,
	RowCellData,
	RowCellWarning,
	RowSelectionMode,
	SpreadsheetMode
} from '@main/common/spreadsheet/components';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

import {
	BoardFieldService,
	BoardService
} from '../../../services';

import {
	RecordService
} from '../../record/services';

import {
	InfoSheet,
	IFieldsExcel,
	DataPreview,
	ItemRecord,
	ManualOption,
	ManualMappingOption,
	IValidDate
} from '../interfaces';
import {
	FileExtension
} from '../resources/constant';
import {
	dateToJSDate,
	getCountryByDialCode
} from '../helpers';
import {
	ImportXLSXService
} from './import-xlsx.service';
import {
	ImportCSVService
} from './import-csv.service';
import {
	ImportSpreadsheetsService
} from './import-spreadsheet.service';
import {
	ImportValidateService
} from './import-validate.service';

@Injectable()
export class ImportService {
	public excelFieldOptions: Record<ULID, ManualOption[]>;

	public dataPreview: DataPreview = {
		config : {
			mode: SpreadsheetMode.Creator,
			column: {
				frozenIndex: null,
				arrangeable: false,
				calculable: false,
				creatable: false,
				freezable: false,
				groupable: false,
				hideable: false,
				manageable: false,
				resizable: false,
				sortable: false,
				default: {
					editable: false,
				},
			},

			row: {
				size: ROW_SIZES[0],
				selectionMode: RowSelectionMode.None,
				arrangeable: false,
				creatable: false,
				expandable: false,
				exportable: false,
				indexable: false, // Temp
				printable: false,
			},
		},
		columns : [],
		rows : [],
	};

	public dataHeader: Row = {
		id: null,
		data: {},
		content: {},
		warning: {},
		editable: false,
		deletable: false,
		selected: false,
	};
	public infoSheet: InfoSheet;
	public newColumns: Column;

	private readonly _importXLSXService: ImportXLSXService
		= inject( ImportXLSXService );
	private readonly _importCSVService: ImportCSVService
		= inject( ImportCSVService );
	private readonly _importSpreadsheetsService: ImportSpreadsheetsService
		= inject( ImportSpreadsheetsService );
	private readonly _importValidateService: ImportValidateService
		= inject( ImportValidateService );

	protected readonly _fieldHelper: FieldHelper
		= new FieldHelper();
	protected readonly _userService: UserService
		= new UserService();
	protected readonly _boardService: BoardService
		= new BoardService();
	protected readonly _boardFieldService: BoardFieldService
		= new BoardFieldService();
	protected readonly _recordService: RecordService
		= new RecordService();

	private _serviceMap: Record<
		FileExtension,
		ImportCSVService | ImportXLSXService | ImportSpreadsheetsService
	> = {
			[FileExtension.CSV]: this._importCSVService,
			[FileExtension.XLSX]: this._importXLSXService,
			[FileExtension.SPREADSHEET]: this._importSpreadsheetsService,
		};

	// TEMP
	private _usersObj: Record<ULID, IUser[]>;
	private _referenceRecordsObj: Record<ULID, ReferenceRecord[]>;
	private _newDropdownOptionsObj: Map<ULID, Map<string, DropdownOption>>;

	/**
	 * @param {string} fileExt
	 * @return {void}
	 */
	public destroyWorker(
		fileExt: string
	) {
		this
		._serviceMap[ fileExt ]
		.destroyWorker();
	}

	/**
	 * @param {string} fileExt
	 * @param {CUBFile} currentFile
	 * @return {void}
	 */
	public async handleReadFile(
		fileExt: string,
		currentFile: CUBFile
	) {
		this.infoSheet
			= await
			this
			._serviceMap[ fileExt ]
			.readFile(
				currentFile.metadata
			);
	};

	/**
	 * @param {string} fileExt
	 * @param {string} sheetName
	 * @return {void}
	 */
	public async getCurrentSheet(
		fileExt: string ,
		sheetName: string
	) {
		this.infoSheet
			= await
			this
			._serviceMap[ fileExt ]
			.getCurrentSheet(
				sheetName
			);
	}

	/**
	 * @return {IFieldsExcel[]}
	 */
	public initFields(): IFieldsExcel[] {
		return _.map(
			this.infoSheet.headers,
			(header: string, index: number) => ({
				header,
				isMatch: false,
				field: null,
				fieldCurrent: {
					value: header,
					index,
				},
				fieldTarget: {
					value: '',
					index: -1,
				},
				isAuto: true,
				totalError: 0,
				isHasTitle: true,
				totalRows: this.infoSheet.totalRows,
			})
		) as IFieldsExcel[];
	}

	/**
	 * @param { FieldExtra[]} fields
	 * @param {string} mode
	 * @param {IFieldsExcel[]} fieldsExcel
	 */
	public mapFields(
		fields: FieldExtra[],
		fieldsExcel: IFieldsExcel[],
		mode: 'change' | 'new'
	): IFieldsExcel[] {
		this.excelFieldOptions = null;

		if(this.infoSheet.headers?.length === 0) return;

		if(mode === 'new'){
			_.forEach(
				this.infoSheet.headers,
				(header: string) => {
					const foundItem: FieldExtra | undefined
						= _.find(fields,
							(field: FieldExtra) =>
								field?.name?.trim().toUpperCase()
								=== header?.trim().toUpperCase()
						);
					if (foundItem) {
						const newIndex: number
							= _.findIndex(fieldsExcel,
								(f: IFieldsExcel) =>
									f?.fieldCurrent?.value?.trim().toUpperCase()
									=== header?.trim()?.toUpperCase()
						  	);

						const indexField: number
							= _.findIndex(fields,
								(f: FieldExtra) => f.id === foundItem.id
							);

						if (newIndex !== -1) {
							_.assign(fieldsExcel[newIndex], {
								isMatch: true,
								field: foundItem,
								fieldTarget: {
								  value: foundItem.name,
								  index: indexField,
								},
							});
						}
					}
				}
			);
		}

		this
		._importValidateService
		.initDataValidate(
			this.infoSheet,
			fields
		);

		return fieldsExcel;
	}

	/**
	 * @param {FieldExtra[]} fields
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @return {Promise<DataPreview>}
	 */
	public async getDataPreview(
		fields: FieldExtra[],
		fieldsExcel: IFieldsExcel[]
	): Promise<DataPreview> {
		this.dataPreview.columns
			= this._getDataColumnsPreview(
				fields,
				fieldsExcel
			);

		this.dataPreview.rows
			= await this._getDataRowsPreview(
				fieldsExcel,
				this.dataPreview.columns
			) || [];

		if (
			this.dataPreview?.rows?.[ 0 ]
		) {
			this.dataHeader = this.dataPreview?.rows[ 0 ];
		}

		return this.dataPreview;
	}

	/**
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @param {Record<ULID, ManualMappingOption>} manualMappingOptions
	 * @return {Promise<Row[]>}
	 */
	public async updateRowsPreview(
		fieldExcel: IFieldsExcel,
		column: Column,
		manualMappingOptions?: Record<ULID, ManualMappingOption>
	): Promise<Row[]> {
		//* Only update 1 spreadsheet column and 1 excel column
		const newRows: Row[]
			= await this._getDataRowsPreview(
				[ fieldExcel ],
				[ column ],
				manualMappingOptions
			) || [];

		return new Promise( ( resolve: any ) => resolve( newRows ) );
	}

	/**
	 * @param {DataPreview} dataPreview
	 * @returns {ItemRecord[]}
	 */
	public getItemRecord(
		dataPreview: DataPreview
	): ItemRecord[] {
		if (
			!dataPreview
		) return;

		const dataImport: ItemRecord[]
			= dataPreview.rows?.map((row: Row) => ({
				cells: dataPreview.columns.reduce(
					(rowData: any, col: Column) => {
						if (!col.hidden) {
							const field: Field = col.field;
							let value: any;

							switch (field.dataType) {
								case DataType.Email:
									value = row.data[ col.id ];
									if(typeof value !== 'string' || value === ''){
										value = null;
									}
									break;
								case DataType.Currency:
								case DataType.Progress:
								case DataType.Number:
									value = row.data[ col.id ];
									if(typeof value !== 'number'){
										value = null;
									}
									break;
								case DataType.Rating:
									value = row.data[ col.id ];
									if(typeof value !== 'number' || value === 0) {
										value = null;
									}
									break;
								case DataType.Checkbox:
									value = row.data[ col.id ];
									if(typeof value !== 'boolean'){
										value = false;
									}
									break;
								case DataType.Date:
									const momentObj: moment.Moment
										= moment(row.data[ col.id ], 'YYYY-MM-DD HH:mm');
									const utcDateTime: moment.Moment
										= momentObj.utc();
									value = utcDateTime.toISOString();
									break;
								case DataType.People:
									value = row.data[ col.id ];
									const errPeople: boolean
										= value?.selected?.some(
											(item: IUser) => item.error
										);
									if(errPeople){
										value = null;
									}
									break;
								case DataType.Reference:
									value = row.data[ col.id ];
									const errReference: boolean
										= value?.selected?.some(
											(item: any) => item.error
										);
									if(errReference){
										value = null;
									}
									break;
								default:
									value = row.data[ col.id ];
							}
							if(!_.isNull(value)){
								rowData[ col.id ] = value;
							}
						}
						return rowData;
					}, {}),
			}));

		return dataImport;
	}

	/**
	 * @param {FieldExtra[]} fields
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @param {string} idField
	 * @param {number} iCurrentField
	 * @param {DataPreview} dataPreview
	 * @return {Promise<DataPreview>}
	 */
	public async getFieldChange(
		fields: FieldExtra[],
		fieldsExcel: IFieldsExcel[],
		idField: string,
		iCurrentField: number,
		dataPreview: DataPreview
	): Promise<DataPreview> {
		const newDataPreview: DataPreview
			= _.cloneDeep(dataPreview);

		const iFieldTarget: number
			= _.findIndex(fields, ['id', idField]);

		const newFieldExcel: IFieldsExcel = {
			totalRows: 0,
			totalError: 0,
			isMatch: true,
			isAuto: true,
			fieldCurrent: {
				value: fieldsExcel[iCurrentField].fieldCurrent.value,
				index: fieldsExcel[iCurrentField].fieldCurrent.index,
			},
			fieldTarget: {
				value: fields[iFieldTarget].name,
				index: iFieldTarget,
			},
			field: fields[iFieldTarget],
		};

		this._importValidateService.dataValidate[ fields[iFieldTarget].id ] = {
			field: fields[iFieldTarget],
			columns: _.map(this.infoSheet.records, (row: any) => ({
				value: row[ newFieldExcel.fieldCurrent.index ],
				isError: false,
				header: this
				.infoSheet
				.headers[ newFieldExcel.fieldCurrent.index ],
			})),
		};

		this.newColumns = {
			field: this._fieldHelper.createField(
				(fields[iFieldTarget] as Field)
			),
			hidden: false,
			warning: newFieldExcel.totalError > 0,
			width: 180,
			id: newFieldExcel.field.id,
			editable: false,
			deletable: false,
		};

		const newRows: Row[]
			= await this._getDataRowsPreview(
				[ newFieldExcel ],
				[ this.newColumns ]
			) || [];

		if(
			!_.find(
				newDataPreview.columns,
				{ id: this.newColumns.id }
			)
		) {
			newDataPreview.columns.push( this.newColumns );
		}

		fieldsExcel[iCurrentField]
			= _.cloneDeep(newFieldExcel);

		const listTargetMatch: string[]
			= fieldsExcel
			.filter( (f: IFieldsExcel) => f.isMatch )
			.map( (f: IFieldsExcel ) => f.fieldTarget.value );

		newDataPreview
		.columns
		.map(
			( col: Column ) => {
				col.hidden = !listTargetMatch.includes(col.field.name);
			}
		);

		newDataPreview.rows = newRows.map(
			( row: Row, iRow: number ) => {
				row.data[this.newColumns.id]
					= newRows[iRow]?.data[this.newColumns?.id];

				row.content[this.newColumns.id]
					= newRows[iRow]?.content[this.newColumns?.id];

				row.warning[this.newColumns.id]
					= newRows[iRow]?.warning[this.newColumns?.id];

				return row;
			}
		);

		const newColId: string = this.newColumns.id;

		if ( this.dataHeader ) {
			const newRow: Row = newRows[ 0 ];
			this.dataHeader.id = newRow.id;
			this.dataHeader.data[newColId] = newRow.data[newColId];
			this.dataHeader.content[newColId] = newRow.content[newColId];
			this.dataHeader.warning[newColId] = newRow.warning[newColId];
		}

		this.dataPreview.columns = newDataPreview.columns;
		this.dataPreview.rows = newDataPreview.rows;

		return newDataPreview;
	}

	/**
	 * @param {FieldExtra[]} fields
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @return {Column[]}
	 */
	private _getDataColumnsPreview(
		fields: FieldExtra[],
		fieldsExcel: IFieldsExcel[]
	): Column[] {
		const dataColumns: Column[] = [];

		fields
		.map((_f: Field, index: number) => {
			return {
				field: _.find(fieldsExcel,
					(x: IFieldsExcel) => x.fieldTarget.index === index),
				index,
			};
		})
		.filter(
			(item: { field: IFieldsExcel | undefined; index: number }) =>
				!!item.field
		)
		.forEach((item: { field: IFieldsExcel | undefined; index: number }) => {
			const foundField: IFieldsExcel = item.field as IFieldsExcel;
			const field: Field = foundField.field as Field;
			const fieldId: string = foundField.field.id;

			if (!_.find(dataColumns,
				(col: Column) => col.id === fieldId)
			) {
				dataColumns.push({
					field: this._fieldHelper.createField(field),
					hidden: false,
					warning: foundField.totalError > 0,
					width: 180,
					id: fieldId,
					editable: false,
					deletable: false,
				});
			}
		});

		return dataColumns;
	}

	/**
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @param {Column[]} columns
	 * @param {Record<ULID, ManualMappingOption>} manualMappingOptions
	 * @return {Promise<Row[]>}
	 */
	private async _getDataRowsPreview(
		fieldsExcel: IFieldsExcel[],
		columns: Column[],
		manualMappingOptions?: Record<ULID, ManualMappingOption>
	): Promise<Row[]> {
		const rows: Row[] = [];
		this._newDropdownOptionsObj = new Map();

		//* If data exists that has been auto mapped and needs validation, then browse through it
		const dataValidateEntries: [ ULID, IValidDate ][]
			= Object.entries( this._importValidateService.dataValidate );

		if ( dataValidateEntries.length === 0 ) return;

		const fieldRecord: Record<ULID, IFieldsExcel>
			= _.keyBy(
				fieldsExcel,
				'field.id'
			);

		for (
			let index: number = 0; index < this.infoSheet.totalRows; index++
		) {
			let row: Row
				= await this._setRowCellData(
					index,
					fieldRecord,
					columns,
					manualMappingOptions
				);

			if (
				this.dataPreview.rows?.[ index ]
			) {
				row = {
					...this.dataPreview.rows?.[ index ] || {},
					...row,
					data: {
						...this.dataPreview.rows?.[ index ]?.data,
						...row.data,
					},
					warning: {
						...this.dataPreview.rows?.[ index ]?.warning,
						...row.warning,
					},
					content: {
						...this.dataPreview.rows?.[ index ]?.content,
						...row.content,
					},
				};
			}

			rows.push(
				row
			);
		}

		return new Promise( ( resolve: any ) => resolve( rows ) );
	}

	/**
	 * @param {number} iRow
	 * @param {Record<ULID, IFieldsExcel>} fieldsRecord
	 * @param {Column[]} columns
	 * @param {Record<ULID, ManualMappingOption>} manualMappingOptions
	 * @return {Promise<Row>}
	 */
	private async _setRowCellData(
		iRow: number,
		fieldsRecord: Record<ULID, IFieldsExcel>,
		columns: Column[],
		manualMappingOptions?: Record<ULID, ManualMappingOption>
	): Promise<Row> {
		const rowCellData: RowCellData = {};
		const rowData: RowCellContent = {};
		const warningData: RowCellWarning = {};
		const contentData: RowCellContent = {};
		for ( const column of columns ) {
			const field: Field = column?.field;
			const excelField: IFieldsExcel
				= fieldsRecord[ field.id ];
			const currentValue: any
				= this._importValidateService
				.dataValidate[ field.id ]
				?.columns[ iRow ]
				?.value;

			let newValue: any;

			switch ( field.dataType ) {
				case DataType.Dropdown:
					newValue
						= this._processDropdownDataType(
							currentValue && String(currentValue),
							field as DropdownField,
							manualMappingOptions?.[ field.id ]
						) as DropdownData;

					//* Validate Dropdown
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldDropDown(
							excelField.field, newValue
						);
					break;
				case DataType.People:
					this._usersObj ||= {};

					if (
						this._usersObj[ column.id ]
					) {
						newValue
							= this._processPeopleDataType(
								currentValue,
								field as PeopleField,
								manualMappingOptions?.[ field.id ]
							);
					} else {
						this._usersObj[ column.id ]
							= await lastValueFrom(
								this._userService
								.getUsersFromPeopleField(
									_.pick(
										// eslint-disable-next-line max-len
										field as PeopleField,
										'includeSetting',
										'excludeSetting'
									)
								)
								.pipe(
									// eslint-disable-next-line max-len
									untilCmpDestroyed( this )
								)
							);

						newValue
							= this._processPeopleDataType(
								currentValue,
								field as PeopleField,
								manualMappingOptions?.[ field.id ]
							);
					}

					//* Validate fieldPeople
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldPeople(
							excelField.field, newValue
						);

					break;
				case DataType.Reference:
					this._referenceRecordsObj ||= {};

					if (
						this._referenceRecordsObj[ column.id ]
					) {
						newValue
							= this._processReferenceDataType(
								currentValue,
								field as ReferenceField,
								manualMappingOptions?.[ field.id ]
							);
					} else {
						this._referenceRecordsObj[ column.id ]
							= await lastValueFrom(
								this._recordService
								.getListReferenceByView(
									field.params?.reference?.viewID
								)
								.pipe(
									map(
										( items: ReferenceItem[] ) => {
											return _.map(
												items,
												( item: ReferenceItem ) => {
													return {
														id: item.id,
														data: item.data,
													};
												}
											);
										}
									),
									untilCmpDestroyed( this )
								)
							);

						newValue
							= this._processReferenceDataType(
								currentValue,
								field as ReferenceField,
								manualMappingOptions?.[ field.id ]
							);
					}

					//* Validate Reference
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldReference(
							excelField.field, newValue
						);
					break;
				case DataType.Link:
					newValue
						= currentValue
							? { link: currentValue }
							: null;

					//* Validate Link
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldLink(
							excelField.field, newValue
						);
					break;
				case DataType.Phone:
					newValue
						= currentValue
							? {
								phone: currentValue && String(currentValue),
								countryCode: getCountryByDialCode(currentValue)
								|| excelField.field.params?.countryCode,
							}
							: null;

					//* Validate Phone
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldPhone(
							excelField.field, newValue
						);;
					break;
				case DataType.Paragraph:
					newValue
						= currentValue
							? {
								data: null,
								html:  currentValue && String(currentValue),
								text:  currentValue && String(currentValue),
							}
							: null;

					//* Validate Paragraph
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldParagraph(
							excelField.field, newValue
						);

					break;
				case DataType.Text:
					newValue = currentValue
						? String(currentValue)
						: null;
					//* Validate Text
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldText(
							excelField.field, newValue
						);
					break;
				case DataType.Progress:
					newValue = currentValue;

					//* Validate Progress
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldProgress(
							excelField.field, newValue
						);
					break;
				case DataType.Date:
					if(typeof currentValue === 'number'){
						newValue = dateToJSDate(
							currentValue
						);
					}else{
						newValue = currentValue;
					}

					//* Validate Date
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldDate(
							excelField.field, newValue
						);
					break;
				case DataType.Checkbox:
					newValue
						= this._processCheckboxDataType(
							currentValue
						);

					//* Validate Checkbox
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldCheckbox(
							excelField.field, newValue
						);
					break;
				case DataType.Number:
					newValue = currentValue;

					// TODO
					// if (
					// 	this.infoSheet.isHasTitle
					// 	&& iRow === 0
					// ) break;

					//* Validate Number
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldNumber(
							excelField.field, newValue
						);
					break;
				case DataType.Rating:
					newValue = currentValue;

					//* Validate Rating
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldRating(
							excelField.field, newValue
						);
					break;
				case DataType.Email:
					newValue = currentValue && String(currentValue);

					//* Validate Email
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldEmail(
							excelField.field, newValue
						);

					break;
				case DataType.Currency:
					newValue = currentValue;

					//* Validate Currency
					this._importValidateService
					.dataValidate[ field.id ]
					.columns[ iRow ].isError
						= this._importValidateService.fieldCurrency(
							excelField.field, newValue
						);
					break;
			}

			rowCellData[ column.id ] = newValue;

			const err: boolean
				= this._importValidateService
				.dataValidate[ field.id ]
				?.columns[ iRow ]
				?.isError;

			if(
				err
			){
				warningData[ field.id ] = true;

				switch ( field.dataType ) {
					case DataType.People:
					case DataType.Reference:
						rowData[ field.id ]
							= rowCellData[ field.id ];
						break;
					default:
						contentData[ field.id ]
							= currentValue as string;
						break;
				}
			} else {
				warningData[ field.id ] = false;
				rowData[ field.id ] = rowCellData[ field.id ];
			}
		}

		return new Promise( ( resolve: any ) => resolve( {
			id: ulid(),
			deletable: false,
			editable: false,
			selected: false,
			data: rowData,
			warning: warningData,
			content: contentData,
		} ) );
	}

	/**
	 * @param {string} currentValue
	 * @param {DropdownField} field
	 * @param {ManualMappingOption} manualMappingOptions
	 * @return {DropdownData}
	 */
	private _processDropdownDataType(
		currentValue: string,
		field: DropdownField,
		manualMappingOptions?: ManualMappingOption
	): DropdownData {
		let newOption: DropdownOption;
		const currentValueSplit: string[]
			= _.chain( currentValue?.toString()?.split(',') )
			.map( ( s: string ) => s.trim() )
			.filter((s: string) => s !== '')
			.uniq()
			.value();

		const newData: DropdownData = {
			value: [],
			selected: [],
			newOptions: [],
		};

		if (
			_.isStrictEmpty( manualMappingOptions )
		) {
			const fieldOptionsLkName: Record<string, DropdownOption>
				= _.keyBy(
					field.options,
					'name'
				);

			this.excelFieldOptions ||= {};
			this.excelFieldOptions[ field.id ] ||= [];

			if (
				field.isMultipleSelect
			) {
				currentValueSplit.forEach(
					( excelOption: string, i: number ) => {
						excelOption = excelOption.trim();

						newOption
							= fieldOptionsLkName[ excelOption ]
							|| this._newDropdownOptionsObj
							?.get( field.id )
							?.get( excelOption );

						if ( _.isStrictEmpty( newOption ) ) {
							newOption = {
								name: excelOption,
								color: ACCENT_COLORS[ i ],
								value: ulid(),
							};

							if (
								!this._newDropdownOptionsObj.get( field.id )
							) {
								this._newDropdownOptionsObj.set(
									field.id,
									new Map()
								);
							}

							this
							._newDropdownOptionsObj
							.get( field.id )
							.set( newOption.name, newOption );

							newData.newOptions.push( newOption );
						}

						newData.value.push( newOption.value );
						newData.selected.push( newOption );

						if (
							!this
							.excelFieldOptions[ field.id ]
							.some(
								( o: ManualOption ) => {
									return o.name === excelOption;
								}
							)
						) {
							this
							.excelFieldOptions[ field.id ]
							.push({
								name: newOption.name,
								id: newOption.value,
							});
						}
					}
				);
			} else {
				newOption
					= fieldOptionsLkName[ currentValue ]
					|| this._newDropdownOptionsObj
					?.get( field.id )
					?.get( currentValue );

				if ( _.isStrictEmpty( newOption ) ) {
					newOption = {
						name: currentValue,
						color: ACCENT_COLORS[ 0 ],
						value: ulid(),
					};

					if (
						!this._newDropdownOptionsObj.get( field.id )
					) {
						this._newDropdownOptionsObj.set(
							field.id,
							new Map()
						);
					}

					this
					._newDropdownOptionsObj
					.get( field.id )
					.set( newOption.name, newOption );

					newData.newOptions.push( newOption );
				}

				newData.value.push( newOption.value );
				newData.selected.push( newOption );
				this
				.excelFieldOptions[ field.id ]
				.push({
					name: newOption.name,
					id: newOption.value,
				});
			}
		} else {
			const fieldOptionsLkValue: Record<string, DropdownOption>
				= _.keyBy(
					field.options,
					'value'
				);

			if ( field.isMultipleSelect ) {
				currentValueSplit.forEach(
					( excelOption: string, i: number ) => {
						excelOption = excelOption.trim();

						newOption
							= fieldOptionsLkValue
							[manualMappingOptions[ excelOption ]]
							|| this._newDropdownOptionsObj
							?.get( field.id )
							?.get( excelOption );

						if ( _.isStrictEmpty( newOption ) ) {
							newOption = {
								name: excelOption,
								color: ACCENT_COLORS[ i ],
								value: ulid(),
							};

							if (
								!this._newDropdownOptionsObj.get( field.id )
							) {
								this._newDropdownOptionsObj.set(
									field.id,
									new Map()
								);
							}

							this
							._newDropdownOptionsObj
							.get( field.id )
							.set( newOption.name, newOption );

							newData.newOptions.push( newOption );
						}

						newData.value.push( newOption.value );
						newData.selected.push( newOption );
					}
				);
			} else {
				newOption
					= fieldOptionsLkValue[ manualMappingOptions[ currentValue ]]
					|| this._newDropdownOptionsObj
					?.get( field.id )
					?.get( currentValue );

				if ( _.isStrictEmpty( newOption ) ) {
					newOption = {
						name: currentValue,
						color: ACCENT_COLORS[ 0 ],
						value: ulid(),
					};

					if (
						!this._newDropdownOptionsObj.get( field.id )
					) {
						this._newDropdownOptionsObj.set(
							field.id,
							new Map()
						);
					}

					this
					._newDropdownOptionsObj
					.get( field.id )
					.set( newOption.name, newOption );

					newData.newOptions.push( newOption );
				}

				newData.value.push( newOption.value );
				newData.selected.push( newOption );
			}
		}

		//* Check if 'newOptions' exists and is an empty array, then remove
		if (newData.hasOwnProperty('newOptions')
			&& Array.isArray(newData.newOptions)
			&& newData.newOptions.length === 0
		) {
			delete newData.newOptions;
		}

		return _.isStrictEmpty( newData.value )
			? null
			: newData;
	}

	/**
	 * @param {string} currentValue
	 * @param {PeopleField} field
	 * @param {ManualMappingOption} manualMappingOptions
	 * @return {PeopleData}
	 */
	private _processPeopleDataType(
		currentValue: string,
		field: PeopleField,
		manualMappingOptions?: ManualMappingOption
	): PeopleData {
		let newOption: IUser;
		const currentValueSplit: string[]
			= _.chain( currentValue?.toString()?.split(',') )
			.map( ( s: string ) => s.trim() )
			.filter((s: string) => s !== '')
			.uniq()
			.value();
		const newData: PeopleData = {
			value: [],
			selected: [],
		};

		this.excelFieldOptions ||= {};
		this.excelFieldOptions[ field.id ] ||= [];

		if (
			_.isStrictEmpty( manualMappingOptions )
		) {
			const usersLkName: Record<string, IUser>
				= _.keyBy(
					this._usersObj[ field.id ],
					'name'
				);

			if (
				field.isMultipleSelect
			) {
				currentValueSplit.forEach(
					( excelOption: string ) => {
						excelOption = excelOption.trim();

						newOption
							= usersLkName[ excelOption ]
								|| {
									name: excelOption,
									id: ulid(),
									error: true,
								} as IUser;
						newData.value.push( newOption.id );
						newData.selected.push( newOption );

						if (
							!this
							.excelFieldOptions[ field.id ]
							.some(
								( o: ManualOption ) => {
									return o.name
										=== excelOption;
								}
							)
						) {
							this
							.excelFieldOptions[ field.id ]
							.push( newOption );
						}
					}
				);
			} else {
				newOption
					= usersLkName[ currentValue ]
						|| {
							id: ulid(),
							name: currentValue,
							error: true,
						} as IUser;

				newData.value.push( newOption.id );
				newData.selected.push( newOption );
				this
				.excelFieldOptions[ field.id ]
				.push( newOption );
			}
		} else {
			const usersLkId: Record<string, IUser>
				= _.keyBy(
					this._usersObj[ field.id ],
					'id'
				);

			if ( field.isMultipleSelect ) {
				currentValueSplit.forEach(
					( excelOption: string ) => {
						excelOption = excelOption.trim();

						newOption
							= usersLkId[ manualMappingOptions[ excelOption ] ]
								|| {
									name: excelOption,
									id: ulid(),
									error: true,
								} as IUser;

						newData.value.push( newOption.id );
						newData.selected.push( newOption );
					}
				);
			} else {
				newOption = usersLkId[ manualMappingOptions[ currentValue ] ]
					|| {
						id: ulid(),
						name: currentValue,
						error: true,
					} as IUser;

				newData.value.push( newOption.id );
				newData.selected.push( newOption );
			}
		}

		return _.isStrictEmpty( newData.value )
			? null
			: newData;
	}

	/**
	 * @param {string} currentValue
	 * @param {ReferenceField} field
	 * @param {ManualMappingOption} manualMappingOptions
	 * @return {ReferenceData}
	 */
	private _processReferenceDataType(
		currentValue: string,
		field: ReferenceField,
		manualMappingOptions?: ManualMappingOption
	): ReferenceData {
		let newOption: ReferenceRecord;
		const currentValueSplit: string[]
			= _.chain( currentValue?.toString()?.split(',') )
			.map( ( s: string ) => s.trim() )
			.filter((s: string) => s !== '')
			.uniq()
			.value();
		const newData: ReferenceData = {
			value: [],
			selected: [],
		};

		this.excelFieldOptions ||= {};
		this.excelFieldOptions[ field.id ] ||= [];

		if (
			_.isStrictEmpty( manualMappingOptions )
		) {
			const recordsLkData: Record<string, ReferenceRecord>
				= _.keyBy(
					this._referenceRecordsObj[ field.id ],
					'data'
				);

			if (
				field.isMultipleSelect
			) {
				currentValueSplit.forEach(
					( excelOption: string ) => {
						excelOption = excelOption.trim();

						newOption
							= recordsLkData[ excelOption ]
								|| {
									data: excelOption,
									id: ulid(),
									error: true,
								};

						newData.value.push( newOption.id );
						newData.selected.push( newOption );

						if (
							!this
							.excelFieldOptions[ field.id ]
							.some(
								( o: ManualOption ) => {
									return o.name === excelOption;
								}
							)
						) {
							this
							.excelFieldOptions[ field.id ]
							.push({
								id: newOption.id,
								name: newOption.data,
							});
						}
					}
				);
			} else {
				newOption
					= recordsLkData[ currentValue ]
						|| {
							id: ulid(),
							data: currentValue,
							error: true,
						};

				newData.value.push( newOption.id );
				newData.selected.push( newOption );
				this
				.excelFieldOptions[ field.id ]
				.push({
					id: newOption.id,
					name: newOption.data,
				});
			}
		} else {
			const recordsLkId: Record<string, ReferenceRecord>
				= _.keyBy(
					this._referenceRecordsObj[ field.id ],
					'id'
				);

			if ( field.isMultipleSelect ) {
				currentValueSplit.forEach(
					( excelOption: string ) => {
						excelOption = excelOption.trim();

						newOption
							= recordsLkId[ manualMappingOptions[ excelOption ] ]
								|| {
									data: excelOption,
									id: ulid(),
									error: true,
								};

						newData.value.push( newOption.id );
						newData.selected.push( newOption );
					}
				);
			} else {
				newOption = recordsLkId[ manualMappingOptions[ currentValue ] ]
					|| {
						id: ulid(),
						data: currentValue,
						error: true,
					};

				newData.value.push( newOption.id );
				newData.selected.push( newOption );
			}
		}

		return _.isStrictEmpty( newData.value )
			? null
			: newData;
	}

	/**
	 * @param {boolean | string | number} currentValue
	 * @return {boolean}
	 */
	private _processCheckboxDataType(
		currentValue: boolean | string | number
	): boolean | string | null {
		if (typeof currentValue === 'boolean') {
			return currentValue;
		}
		if (typeof currentValue === 'string') {
			const upperCaseValue: any = currentValue.toUpperCase();
			if (upperCaseValue === 'TRUE'
				|| upperCaseValue === 'YES'
			) {
				return true;
			}
			if (upperCaseValue === 'FALSE'
				|| upperCaseValue === 'NO'
			) {
				return false;
			}
		}
		if (typeof currentValue === 'number') {
			return currentValue === 1;
		}
		return currentValue;
	}
};
