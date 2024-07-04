import {
	OnInit,
	Inject,
	inject,
	Optional,
	Component,
	QueryList,
	ViewChild,
	TemplateRef,
	ViewChildren,
	ChangeDetectorRef,
	ChangeDetectionStrategy
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ULID,
	ulid
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed,
	WebSocketService,
	generateUniqueName
} from '@core';

import {
	CUBDialogRef,
	CUB_DIALOG_REF,
	CUB_DIALOG_CONTEXT
} from '@cub/material/dialog';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastService,
	CUBToastPosition
} from '@cub/material/toast';
import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';
import {
	CUBMenuComponent
} from '@cub/material/menu';
import {
	CUBPopupService
} from '@cub/material/popup';

import {
	FIELD_METADATA
} from '@main/common/field/resources';
import {
	DataType,
  	DropdownOption,
  	FieldExtra,
	ReferenceItem
} from '@main/common/field/interfaces';
import {
	Column,
	Row
} from '@main/common/spreadsheet/components';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	Field
} from '@main/common/field/objects';

import {
	BoardFieldService
} from '../../../services';
import {
	BoardField,
	BoardFieldCreate
} from '../../../interfaces';

import {
	RecordService
} from '../../record/services';
import {
	BoardFieldExtend
} from '../../form/components';


import {
	InfoSheet,
	DialogPreviewContext,
	IFieldsExcel,
	DataPreview,
	ItemRecord,
	FieldSupport,
	ManualOption,
	ManualMappingOption
} from '../interfaces';
import {
	ExportFileService,
	ImportApiService,
	ImportService
} from '../services';
import {
	BATCH_SIZE_IMPORT,
	LIMIT_ITEMS,
	MAX_PAGE,
	fieldTypeNotSupport,
	reportName
} from '../resources';

import {
	PopupImportComponent
} from './popup-import.component';

@Unsubscriber()
@Component({
	selector: 'dialog-preview',
	templateUrl: '../templates/dialog-preview.pug',
	styleUrls: [ '../styles/dialog-preview.scss', '../styles/toast.scss' ],
	host: { class: 'dialog-preview' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPreviewComponent
implements OnInit {

	@ViewChildren( 'optionNameInput' )
	protected readonly optionNameInputs: QueryList<CUBFormFieldInputDirective>;
	@ViewChild( 'toastFail' )
	private _toastFail: TemplateRef<any>;
	@ViewChild( 'warningPopup' )
	private _warningPopup: TemplateRef<any>;
	@ViewChild( 'addManualOptionMenu' )
	private _addManualOptionMenu: CUBMenuComponent;;

	protected readonly DATA_TYPE: typeof DataType = DataType;

	protected isHidden: boolean;
	protected isSelectAll: boolean;
	protected isRemoveAll: boolean;
	protected isLoading: boolean;
	protected percentLoading: number = 0;
	protected fieldSupport: FieldSupport[];
	protected itemsPerPage: number = LIMIT_ITEMS;
	protected maxPage: number = MAX_PAGE;
	protected fields: FieldExtra[];
	protected fieldsBk: FieldExtra[] = [];
	protected infoSheet: InfoSheet;
	protected dataPreview: DataPreview;
	protected fieldsExcel: IFieldsExcel[];
	protected rows: Row[] = [];
	protected rowsTempt: Row[] = [];
	protected totalRows: number = 0;
	protected fieldTypeNotSupport: ReadonlySet<DataType>
		= fieldTypeNotSupport;
	protected dataHeaders: any;
	// Mapping advance
	// people
	protected peopleFieldOptions: Record<ULID, IUser[]>;

	// people
	protected referenceFieldOptions: Record<ULID, ReferenceItem[]>;

	// dropdown
	protected dropdownFieldOptions: Record<ULID, DropdownOption[]>;
	protected excelFieldOptions: Record<ULID, ManualOption[]>;

	// common
	protected isSelectAllManualOption: Record<ULID, boolean>;
	protected manualValueOptions: Record<ULID, ManualOption[]>;
	protected mappingValueOptions: Record<ULID, ManualMappingOption>;
	// Mapping advance

	private _boardID: string;
	private _importID: string;
	private _dataPreviewBk: DataPreview;
	private _fieldsExcelBK: IFieldsExcel[] = [];
	private _newFields: FieldExtra[] = [];
	private _excelHeaderOptions: Record<ULID, ManualOption[]> = {};
	private _toasts: Map<any, ULID>;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _importService: ImportService
		= inject( ImportService );
	private readonly _importApiService: ImportApiService
		= inject( ImportApiService );
	private readonly _cubToastService: CUBToastService
		= inject( CUBToastService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _exportFileService: ExportFileService
		= inject( ExportFileService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _webSocketService: WebSocketService
		= inject( WebSocketService );

	get isErrorField(): boolean {
		return _.some(
			this.dataPreview.columns,
			'warning'
		);
	}

	/**
	 * @constructor
	 * @param {CUBDialogRef} _dialogRef
	 */
	constructor(
		@Inject( CUB_DIALOG_REF )
		private _dialogRef: CUBDialogRef,
		@Optional() @Inject( CUB_DIALOG_CONTEXT )
		protected dialogContext: DialogPreviewContext
	) {
		this.fields = this.dialogContext.fields;
		this._boardID = this.dialogContext.boardID;
		this.dataPreview = this.dialogContext.dataPreview;
		this.infoSheet = this._importService.infoSheet;
		this.fieldsExcel = this.dialogContext.fieldsExcel;
		this.rowsTempt
			= this.infoSheet.isHasTitle
				? _.drop( this.dataPreview.rows )
				: this.dataPreview.rows;
	}

	ngOnInit() {
		this._fieldsExcelBK = this.dialogContext.fieldsExcel;
		this.excelFieldOptions = _.cloneDeep(
			this._importService.excelFieldOptions
		);
		this._getFieldSupport();
		this._dataPreviewBk = this.dialogContext?.dataPreview;
		this.onCheckTitle(true);
		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._importCancel();
		this._updatePercentLoading();
		this._updateErrors(
			this._dataPreviewBk?.columns,
			this._dataPreviewBk?.rows,
			this._fieldsExcelBK
		);
	}

	/**
	 * @return {void}
	 */
	protected onPageChange(
		data: Row[]
	) {
		this.rows = data;
		this._cdRef.detectChanges();
	}

	/**
	 * @param {boolean} event
	 * @return {void}
	 */
	protected async onCheckTitle(
		event: boolean
	) {
		if ( this.infoSheet.isHasTitle === event ) {
			return;
		}

		this._getExcelFieldOptions();
		this.infoSheet.isHasTitle = event;
		this._getDataSpreadsheet('change');
		this._setExcelFieldOptions();
		this._updateErrors(
			this.dataPreview.columns,
			this.dataPreview.rows,
			this.fieldsExcel
		);
	}

	/**
	 * @return {void}
	 */
	protected onSelectAll() {
		_.forEach(this.fieldsExcel, (item: IFieldsExcel, index: number) => {
			const originalItem: IFieldsExcel = this.fieldsExcel[index];

			if(!originalItem.isMatch){
				_.assign(item, {
					isMatch: true,
					field: null,
					totalError: 0,
					totalRows: 0,
					isAuto: true,
				});
			}else{
				_.assign(item, originalItem);
			}
		});

		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._getFieldSupport();
		this._getDataSpreadsheet('get');

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected onRemoveAll() {
		_.forEach(this.fieldsExcel, (item: IFieldsExcel) => {
			_.assign(item, {
				isAuto: false,
				isMatch: false,
				field: null,
				totalRows: 0,
				totalError: 0,
				fieldTarget: {
					value: '',
					index: -1,
				},
			});
		});
		this.excelFieldOptions = null;
		this.dataPreview.columns = [];
		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._getFieldSupport();
		this._getDataSpreadsheet('get');
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected onResetAll() {
		this.fieldsExcel = _.cloneDeep(this._fieldsExcelBK);
		this.dataPreview.columns = _.cloneDeep(this._dataPreviewBk.columns);
		this.dataPreview.rows =_.cloneDeep(this._dataPreviewBk.rows);
		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._getFieldSupport();
		this.onCheckTitle(true);
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _setStateSelectAll(){
		this.isSelectAll = this.fieldsExcel.every(
			( field: IFieldsExcel ) => field.isMatch);
	}

	/**
	 * @return {void}
	 */
	private _setStateRemoveAll(){
		this.isRemoveAll = this.fieldsExcel.every(
			( field: IFieldsExcel ) => !field.isMatch);
	}

	// ************************************************************
	// HANDLE FIELD
	// ************************************************************

	/**
	 * @return {void}
	 */
	protected async onFieldChange(
		id: string,
		iCurrentField: number
	) {
		this.dataPreview
			= await this._importService.getFieldChange(
				this.fields,
				this.fieldsExcel,
				id,
				iCurrentField,
				this.dataPreview
			);

		this.rowsTempt
			= this.infoSheet.isHasTitle
				? _.drop( this.dataPreview.rows )
				: this.dataPreview.rows;

		this.excelFieldOptions = _.cloneDeep(
			this._importService.excelFieldOptions
		);
		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._getFieldSupport();
		this._getDataSpreadsheet('get');
		this._getExcelFieldOptions();
		this._setExcelFieldOptions();
		this._updateErrors(
			[this._importService.newColumns],
			this.dataPreview.rows,
			this.fieldsExcel
		);
		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	private _getFieldSupport() {
		this.fieldSupport = _.map(this.fields, (f: FieldExtra) => {
			const field: IFieldsExcel | undefined
				= _.find(this.fieldsExcel,
					(item: IFieldsExcel) => item?.field?.id === f.id
				);

			const isMatch: boolean = !!field;

			return {
				...(field ? field?.field : f),
				isMatch,
			};
		});
	}

	/**
	 * @param {boolean} check
	 * @param {number} index
	 * @return {void}
	 */
	protected onCheckField(
		check: boolean,
		index: number
	) {
		const newDataColPre: Column[]
			= _.cloneDeep(this.dataPreview.columns);

		_.assign(
			this.fieldsExcel[index],
			{
				headers: this.fieldsExcel[index].fieldCurrent.value,
				isMatch: check,
				totalError: !check ? 0 : this.fieldsExcel[index].totalError,
				totalRows: !check ? 0 : this.fieldsExcel[index].totalRows,
				field: !check ? null : this.fieldsExcel[index].field,
			}
		);

		const { isMatch }: { isMatch: boolean }
			= this.fieldsExcel[index];

		const targetField: string
			= this.fieldsExcel[index].fieldTarget.value;

		_.forEach(newDataColPre, (col: Column) => {
			//* Show the column only if checked and matched successfully
			if (targetField === col.field.name) {
				col.hidden = !(check && isMatch);
			}
		});

		this.dataPreview.columns = _.cloneDeep(newDataColPre);

		this._setStateSelectAll();
		this._setStateRemoveAll();
		this._getFieldSupport();
		this._setStateColumnPre();
		this._cdRef.markForCheck();
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected createField( field: Field ) {
		const createData: BoardFieldCreate = {
			id		: ulid(),
			boardID	: this._boardID,
			name	: field.name,
			dataType: field.dataType,
		};
		createData.name
			= generateUniqueName(
				_.map(this.fields, (f: FieldExtra): string => {
					return f.name;
				}
				),
				this._translateService.instant(
					FIELD_METADATA.get(
						createData.dataType
					).label
				),
				80
			);

		if ( field.description ) createData.description = field.description;
		if ( field.isRequired ) createData.isRequired = field.isRequired;
		if ( !_.isStrictEmpty( field.initialData ) ) {
			createData.initialData = field.initialData;
		}
		if ( !_.isStrictEmpty( field.toJson()?.params ) ) {
			createData.params = field.toJson().params;
		}
		this._boardFieldService.fieldsAdded$.next([ createData as BoardField ]);
		this._boardFieldService
		.create( createData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( res: BoardField ) => {
				const newField: BoardFieldExtend = res as BoardFieldExtend;
				this.fields.push( newField );
				this._newFields.push(newField);
				this.fieldsBk = _.cloneDeep( this.fields );

				this._getFieldSupport();
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _setStateColumnPre() {
		this.dataPreview.columns
			= this.dataPreview.columns.filter((col: Column)=> !col.hidden);
	}

	/**
	 * @param {Column[]} columns
	 * @param {Row[]} rows
	 * @param {IFieldsExcel[]} fieldsExcel
	 * @return {void}
	 */
	private _updateErrors(
		columns: Column[],
		rows: Row[],
		fieldsExcel: IFieldsExcel[]
	) {
		rows
			= this.infoSheet.isHasTitle
				? _.drop( rows )
				: rows;

		_.forEach(
			columns,
			( column: Column ) => {
				const i: number
					= fieldsExcel.findIndex(
						( f: IFieldsExcel ) => f?.field?.id === column.field.id
					);

				if (
					i < 0
				) return;

				fieldsExcel[ i ].totalError
					= _.filter(
						rows,
						( row: Row ) => {
							return row.warning[ column.field.id ];
						}
					).length;

				column.warning = fieldsExcel [ i ].totalError > 0;
			}
		);
	}

	// ************************************************************
	// HANDLE LOGIC FIELD PEOPLE, DROPDOWN
	// ************************************************************

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onDropdownPickerOpened(
		field: FieldExtra
	) {
		if ( this.dropdownFieldOptions?.[ field.id ] ) {
			return;
		}

		this.dropdownFieldOptions ||= {};

		if ( field.params?.reference ) {
			this._boardFieldService
			.getDropdownOptions( field.params.reference.fieldID )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( options: DropdownOption[] ) => {
					this.dropdownFieldOptions[ field.id ]
						= options;

					this._cdRef.detectChanges();
				},
			});
		} else {
			this.dropdownFieldOptions[ field.id ]
				= field.params?.options;

			this._cdRef.detectChanges();
		}
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onPeoplePickerOpened(
		field: FieldExtra
	) {
		this._userService
		.getUsersFromPeopleField(
			_.pick(
				field.params,
				'includeSetting',
				'excludeSetting'
			)
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( users: IUser[] ) => {
				this.peopleFieldOptions ||= {};
				this.peopleFieldOptions[ field.id ] = users;

				this._cdRef.detectChanges();
			},
		});
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onReferencePickerOpened(
		field: FieldExtra
	) {
		this._recordService
		.getListReferenceByView(
			field.params?.reference?.viewID
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( items: ReferenceItem[] ) => {
				this.referenceFieldOptions ||= {};

				this.referenceFieldOptions[ field.id ]
					= items;

				this._cdRef.detectChanges();
			},
		});
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onAddManualOptionMenuClose(
		field: FieldExtra
	) {
		_.map(
			this.excelFieldOptions[ field.id ],
			( o: ManualOption ) => o.selected = false
		);

		this._checkIsSelectAllManualOption( field );
	}

	/**
	 * @param {boolean} e
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onAddAllManualOption(
		e: boolean,
		field: FieldExtra
	) {
		_.map(
			this.excelFieldOptions[ field.id ],
			( o: ManualOption ) => o.selected = e
		);

		this.isSelectAllManualOption ||= {};
		this.isSelectAllManualOption[ field.id ] = e;
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onAddManualOption(
		field: FieldExtra
	) {
		this._checkIsSelectAllManualOption( field );
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected cancelAddManualOption(
		field: FieldExtra
	) {
		_.map(
			this.excelFieldOptions[ field.id ],
			( o: ManualOption ) => o.selected = false
		);

		this._addManualOptionMenu.close();
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected addValueOptions(
		field: FieldExtra
	) {
		_.forEach(
			this.excelFieldOptions[ field.id ],
			( o: ManualOption ) => {
				if ( !o.selected || o.added ) return;

				this.manualValueOptions ||= {};
				this.manualValueOptions[ field.id ] ||= [];

				this
				.manualValueOptions[ field.id ]
				.push( o );

				o.selected = false;
				o.added = true;
			}
		);

		this._addManualOptionMenu.close();
	}

	/**
	 * @param {ULID} optionID
	 * @param {IFieldsExcel} fieldExcel
	 * @param {ManualOption} manualOption
	 * @return {void}
	 */
	protected onMappingManualOptions(
		optionID: ULID,
		fieldExcel: IFieldsExcel,
		manualOption: ManualOption
	) {
		this.mappingValueOptions ||= {};
		this.mappingValueOptions[ fieldExcel.field.id ] ||= {};

		this
		.mappingValueOptions
		[ fieldExcel.field.id ]
		[ manualOption.name ] = optionID;

		this._setRowsPreview(fieldExcel);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {number} index
	 * @param {string} optionNameUniq
	 * @return {void}
	 */
	protected removeMappingManualOption(
		fieldExcel: IFieldsExcel,
		index: number,
		optionNameUniq: string
	) {
		this
		.manualValueOptions
		[ fieldExcel.field.id ]
		[ index ]
		.added = false;

		this
		.manualValueOptions[ fieldExcel.field.id ]
		.splice(
			index,
			1
		);

		delete this
		.mappingValueOptions
		?.[ fieldExcel.field.id ]
		?.[ optionNameUniq ];

		this._checkIsSelectAllManualOption( fieldExcel.field );
		this._setRowsPreview(fieldExcel);
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	private _checkIsSelectAllManualOption(
		field: FieldExtra
	) {
		this.isSelectAllManualOption ||= {};

		this.isSelectAllManualOption[ field.id ]
			= this
			.excelFieldOptions[ field.id ]
			?.every(
				( o: ManualOption ) => o.selected || o.added
			);
	}

	/**
	 * @return {void}
	 */
	private async _setRowsPreview(
		fieldExcel: IFieldsExcel
	) {
		const colChange: Column
			= _.find(
				this.dataPreview.columns,
				( col: Column ) =>
					col.id === fieldExcel.field.id
			);

		const newRows: Row[]
			= await this._importService
			.updateRowsPreview(
				fieldExcel,
				colChange,
				this.mappingValueOptions || {}
			);

		_.map(
			this.dataPreview.rows,
			( row: Row, iRow: number ) => {
				row.data[colChange.id]
					= newRows[iRow]?.data[colChange?.id];

				row.content[colChange.id]
					= newRows[iRow]?.content[colChange?.id];

				row.warning[colChange.id]
					= newRows[iRow]?.warning[colChange?.id];

			   }
		);

		this.rowsTempt
			= this.infoSheet.isHasTitle
				? _.drop( this.dataPreview.rows )
				: this.dataPreview.rows;

		this.fieldsExcel
			= this._importService.mapFields(
				 this.fields,
				 this.fieldsExcel,
				 'change'
			);
		this._updateErrors(
			this.dataPreview.columns,
			this.dataPreview.rows,
			this.fieldsExcel
		);
	}

	/**
	 * @param {string} type
	 * @return {void}
	 */
	private _getDataSpreadsheet(
		type: 'get' | 'change'
	) {
		let newRow: Row[];
		// const header: Row
		// 	= this._importService.dataHeader;

		if( type === 'change' ) {
			const currentRows: Row[]
				= this.dataPreview.rows;

			if ( this.infoSheet.isHasTitle ) {
				newRow = _.drop( currentRows );
				// if (
				// 	this._dataPreviewBk.rows?.length
				// 		=== this.rowsTempt?.length
				// ) {
				// 	newRow = currentRows.slice( 1 );
				// } else {
				// 	newRow = currentRows;
				// }
			} else {
				newRow = currentRows;
				// if (
				// 	this._dataPreviewBk?.rows?.length
				// 		> this.rowsTempt?.length
				// ) {
				// 	currentRows.unshift( header );

				// 	newRow = currentRows;
				// } else {
				// 	newRow = currentRows;
				// }
			}
		} else {
			newRow = this.rowsTempt;
		}

		this.rowsTempt = _.cloneDeep( newRow );
		this.totalRows = this.rowsTempt?.length;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _getExcelFieldOptions(){
		_.forEach(
			this._importService.excelFieldOptions,
			( options: ManualOption[], key: ULID ) => {
				if (
					options?.length > 0
				) {
					this._excelHeaderOptions[ key ] = [ options[ 0 ] ];
				}
			});
	}

	/**
	 * @return {void}
	 */
	private _setExcelFieldOptions() {
		if(
			this.infoSheet.isHasTitle
		) {
			for ( const key in this.excelFieldOptions ) {
				if ( this.excelFieldOptions.hasOwnProperty( key ) ) {
					const options: ManualOption[]
						= this.excelFieldOptions[ key ];

					if (
						options?.length > 0
					) {
						options.shift();
					}
				}
			}
		} else {
			_.forEach(
				this.excelFieldOptions,
				( options: ManualOption[], key: string ) => {
					const header: ManualOption
						= this._excelHeaderOptions[ key ][ 0 ];

					if (
						options && options.length > 0 && header
					) {
						options.unshift(header);
					}
				}
			);
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {boolean} e
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onChangeMappingMode(
		e: boolean,
		fieldExcel: IFieldsExcel
	) {
		if ( !e ) return;

		this.mappingValueOptions ||= {};
		this.mappingValueOptions[ fieldExcel.field.id ] = {};

		_.map(
			this.excelFieldOptions[ fieldExcel.field.id ],
			( o: ManualOption ) => o.added = false
		);

		this.manualValueOptions ||= {};
		this.manualValueOptions[ fieldExcel.field.id ] = [];

		this._checkIsSelectAllManualOption( fieldExcel.field );

		this._setRowsPreview(fieldExcel);
	}

	// ************************************************************
	// OTHER
	// ************************************************************

	/**
	 * @return {void}
	 */
	protected onDownErrorReport() {
		const errorRows: Row[] = _.filter(
			this.rowsTempt,
			( { warning }: Row ) =>
				_.some(
					warning,
					Boolean
				)
		);

		this._exportFileService.exportXlsx(
			reportName,
			errorRows,
			this.dataPreview.columns
		);
	}

	// ************************************************************
	// HANDLE API
	// ************************************************************

	/**
	 * @return {void}
	 */
	private _importFields() {
		if ( !this._boardID ) {
			this.fields = null;
			return;
		}
		this._importID = ulid();

		this.
		_importApiService
		.importFields( {
			importID: this._importID,
			totalRecords: this.rowsTempt.length,
			fields: [],
			boardID: this._boardID,
		} )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () =>{
				this._importRecords();
			},
			error: (err: any) => {
				if(
					err.status === 403
				) {
					this._showToastFailPerMission();
				} else{
					this._showToastFail();
				}
			},
			complete: () => {
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _importRecords() {
		if ( !this._boardID ) {
			this.fields = null;
			return;
		}
		let countErr: number = 0;
		let itemCount: number = 0;
		let indexRecords: number = 0;
		const dataBatchSize: ItemRecord[] = [];
		const newDataPreview: DataPreview = {
			columns: this.dataPreview.columns,
			rows: this.rowsTempt,
			config: null,
		};
		const dataImport: ItemRecord[]
			= this._importService.getItemRecord(newDataPreview);

		dataImport.forEach((row: ItemRecord, index: number) => {
			dataBatchSize.push(row);
			itemCount++;
			if(itemCount === BATCH_SIZE_IMPORT
				|| index === dataImport.length - 1
			){
				indexRecords++;

				this._importApiService
				.importRecords( {
					importID: this._importID,
					boardID: this._boardID,
					records: dataBatchSize,
					index: indexRecords,
				} )
				.pipe(untilCmpDestroyed( this ))
				.subscribe({
					error: (err: any) => {
						if(err.status === 403){
							this._showToastFailPerMission();
						} else{
							countErr++;
							if(countErr === 1){
								this._showToastFail();
							}
						}

						this.isLoading = false;
						this._cdRef.markForCheck();
					},
				});

				dataBatchSize.length = 0;
				itemCount = 0;
			}
		});

		if(
			countErr === 0
		) {
			this.isLoading = true;
			this._sendSocket();
			this._cdRef.markForCheck();
		}
	}

	/**
	 * @return {void}
	 */
	private _sendSocket(){
		let countErr: number = 0;
		const total: number = this.rowsTempt.length;

		this.
		_importApiService
		.sendSocket(
			this._importID,
			total
		)
		.pipe(untilCmpDestroyed( this ))
		.subscribe({
		  next: ( success: boolean ) => {
				if ( success ) {
					this.isLoading = false;
					this._cdRef.markForCheck();
				}
		  },
		  error: () => {
				countErr++;
				if(countErr === 1){
					this._showToastFail();
					this.isLoading = false;
					this._cdRef.markForCheck();
				}
		  },
		});
	}

	/**
	 * @return {void}
	 */
	private _updatePercentLoading(){
		this
		._importApiService
		.percentSuccess
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next:(percent: number)=>{
				this.percentLoading = percent;
				if(this.percentLoading === 100){
					this._showToastSuccess();
					this._dialogRef.close();
				}
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _importCancel() {
		document.addEventListener(
			'keydown',
			( event: any ) =>{
				if (
					event.key === 'F5'
					|| event.keyCode === 116
				) {
					this._handleCancelImport();
				}
			}
		);

		window.addEventListener(
			'beforeunload',
			() => {
				this._handleCancelImport();
			}
		);

		window.addEventListener(
			'unload',
			() => {
				this._handleCancelImport();
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _handleCancelImport() {
		if (
			!this.isLoading
		) return;

		this._webSocketService
		.emit(
			'board-import.cancel',
			{
				importID: this._boardID,
				boardID: this._importID,
			}
		);
	};

	// ************************************************************
	// HANDLE EVENT TOAST, POPUP, DIALOG...
	// ************************************************************

	/**
	 * @param {boolean} isAuto
	 * @return {void}
	 */
	protected onBeforeSwitchModeFn(
		isAuto: boolean
	) {
		return new Promise(
			( resolve: any ) => {
				if ( !isAuto ) {
					this._cubConfirmService
					.open(
						`BASE.BOARD.IMPORT.MESSAGE.MODE_AUTO_CHANGE`,
						'BASE.BOARD.IMPORT.MESSAGE.MODE_AUTO_CONFIRM',
						{
							warning: true,
							buttonApply: {
								text: 'BASE.BOARD.IMPORT.LABEL.MODE_AUTO_CHANGE',
								type: 'destructive',
							},
							buttonDiscard: 'BASE.BOARD.IMPORT.LABEL.KEEP',
						}
					)
					.afterClosed()
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							resolve( true );
						},
					});
				} else {
					resolve( true );
				}
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected onSubmitData() {
		this._cubConfirmService
		.open(
			this._warningPopup,
			`BASE.BOARD.IMPORT.LABEL.DATA_NO_IMPORTED`,
			{
				buttonApply: 'BASE.BOARD.IMPORT.LABEL.SKIP_AND_CONTINUE',
				buttonDiscard: 'BASE.BOARD.IMPORT.LABEL.CANCEL',
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;
				this._importFields();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onClose() {
		this._cubConfirmService
		.open(
			`BASE.BOARD.IMPORT.MESSAGE.CANCEL_MESSAGE`,
			'BASE.BOARD.IMPORT.MESSAGE.LOST_CURRENT_PROGRESS',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.BOARD.IMPORT.LABEL.CONFIRM_CANCEL',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.BOARD.IMPORT.LABEL.KEEP',
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this._dialogRef.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected openPopupImport() {
		this._popupService.open(
			null,
			PopupImportComponent,
			{
				boardID: this._boardID,
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);

		this._cubToastService.closeAll();
	}

	/**
	 * @param {TemplateRef<any>} templateKey
	 * @param {boolean=} hasConfirm
	 * @return {void}
	 */
	protected onCloseToast(
		templateKey: TemplateRef<any>,
		_hasConfirm: boolean = true
	) {
		this._cubToastService.close(
			this._toasts.get(
				templateKey.elementRef.nativeElement
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _showToastFail() {
		this._toasts ||= new Map();

		this._toasts.set(
			this._toastFail.elementRef.nativeElement,
			this._cubToastService
			.danger(
				this._toastFail,
				{
					canClose: false,
					position: CUBToastPosition.BottomRight,
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _showToastSuccess(){
		this._cubToastService
		.success(
			'BASE.BOARD.IMPORT.MESSAGE.LOADING_SUCCESS',
			{
				position: CUBToastPosition.BottomRight,
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _showToastFailPerMission() {
		this._cubToastService
		.danger(
			'BASE.BOARD.IMPORT.MESSAGE.PERMISSION_DENIED',
			{
				position: CUBToastPosition.BottomRight,
			}
		);
	}
}
