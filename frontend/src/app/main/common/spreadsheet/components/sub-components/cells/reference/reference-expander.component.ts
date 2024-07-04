import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	OnInit,
	Optional,
	ViewChild,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	finalize
} from 'rxjs/operators';
import {
	ulid,
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed,
	WebSocketService
} from '@core';

import {
	CUBPopupRef,
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF
} from '@cub/material';

import {
	RecordService
} from '@main/workspace/modules/base/modules/board/modules/record/services';
import {
	RecordData,
	RecordIDByView
} from '@main/workspace/modules/base/modules/board/modules/record/interfaces';
import {
	BoardFieldService,
	BoardService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField,
	FieldDetail,
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	IReferenceField,
	ReferenceRecord
} from '@main/common/field/interfaces';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	DataViewDetail
} from '@main/workspace/modules/base/modules/board/modules/view/modules/data-view/interfaces';
import {
	DataViewService
} from '@main/workspace/modules/base/modules/board/modules/view/modules/data-view/services';

import {
	IError
} from '@error/interfaces';

import {
	Column,
	Config,
	Row,
	RowSelectionMode,
	SpreadsheetComponent,
	SpreadsheetMode
} from '../../../spreadsheet.component';

type LookupParams = {
	sourceFieldID: ULID;
	sourceBoardID: ULID;
};

type ReferenceExpanderContext = {
	fieldParams: IReferenceField;
	lookupParams: LookupParams;
	readonly: boolean;
	isExpand: boolean;
	itemName: string;
	itemIDs: ULID[];
	onItemSelected?: ( items: ReferenceRecord[] ) => void;
};

enum FilterManageType {
	ALL = 1,
	SELECT = 2,
	SELECTED = 3,
}

type BreadCrumbItem = {
	baseName: string;
	boardName: string;
	viewName?: string;
};

type SelectFilter = {
	id: number;
	label: string;
};

@Component({
	selector: 'reference-expander',
	templateUrl: './reference-expander.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReferenceExpanderComponent
implements OnInit {

	@ViewChild( SpreadsheetComponent )
	private _spreadsheetCmp: SpreadsheetComponent;

	protected readonly FILTER_MANAGE_TYPE: typeof FilterManageType
		= FilterManageType;
	protected readonly SELECT_TYPE: typeof RowSelectionMode
		= RowSelectionMode;
	protected readonly fieldHelper: FieldHelper
		= new FieldHelper();

	protected isLoadedData: boolean;
	protected isLoadingCreateItem: boolean;
	protected isCreate: boolean;
	protected isNoPermission: boolean;
	protected selectedFilter: number = this.FILTER_MANAGE_TYPE.ALL;
	protected itemName: string;
	protected fields: BoardField[];
	protected records: RecordData[];
	protected columns: Column[];
	protected rows: Row[];
	protected filteredRows: Row[];
	protected newRows: Row[];
	protected selectedRecord: ReferenceRecord[];
	protected selectFilterArray: SelectFilter[] = [
		{
			id: this.FILTER_MANAGE_TYPE.ALL,
			label: this._translateService.instant( 'SPREADSHEET.LABEL.ALL_DATA_ITEM' ),
		},
		{
			id: this.FILTER_MANAGE_TYPE.SELECT,
			label: this._translateService.instant( 'SPREADSHEET.LABEL.SELECTED_DATA_ITEM' ),
		},
		{
			id: this.FILTER_MANAGE_TYPE.SELECTED,
			label: this._translateService.instant( 'SPREADSHEET.LABEL.UNSELECTED_DATA_ITEM' ),
		},
	];
	protected canCreateRecord: boolean;
	protected config: Config;
	protected breadCrumbItems: BreadCrumbItem;
	protected fieldDetail: FieldDetail;

	private _bkRows: Row[];

	private readonly _dataViewService: DataViewService
		= inject( DataViewService );

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {ReferenceExpanderContext} popupContext
	 * @param {TranslateService} _translateService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {BoardFieldService} _boardFieldService
	 * @param {RecordService} _recordService
	 * @param {BoardService} _boardService
	 * @param {WebSocketService} _webSocketService
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: ReferenceExpanderContext,
		private _translateService: TranslateService,
		private _cdRef: ChangeDetectorRef,
		private _boardFieldService: BoardFieldService,
		private _recordService: RecordService,
		private _boardService: BoardService,
		private _webSocketService: WebSocketService
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		if ( this.popupContext.lookupParams ) {
			this._getFieldDetail();

			return;
		}

		this._getBoardDetail();
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	protected searchItem( event: string ) {
		if ( this.isNoPermission ) return;

		this.itemName = event;

		if ( !this.itemName ) {
			this.filteredRows = _.cloneDeep( this._bkRows );

			this.filterItem( this.selectedFilter );

			this._cdRef.markForCheck();

			return;
		}

		this.filteredRows = _.filter(
			this.filteredRows,
			( row: Row ) => _.search(
				row.data[ this._getPrimaryFieldID() ],
				this.itemName
			)
		);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected onRowAdded( row: Row ) {
		this.newRows.push( row );

		this.newRows = _.unionBy( this.newRows );
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	protected onRowDeleted( rows: Row[] ) {
		_.forEach( rows, ( row: Row ) => {
			_.remove( this.newRows, { id: row.id } );
		} );
	}

	/**
	 * @param {number} event
	 * @return {void}
	 */
	protected filterItem( event: number ) {
		if ( this.isNoPermission ) return;

		this.selectedFilter = event;

		switch ( this.selectedFilter ) {
			case this.FILTER_MANAGE_TYPE.ALL:
				this.filteredRows = _.cloneDeep( this._bkRows );
				break;

			case this.FILTER_MANAGE_TYPE.SELECT:
				this.filteredRows = _.filter( this._bkRows, ( row: Row ) => {
					return _.includes( this.popupContext.itemIDs, row.id );
				} );
				break;

			case this.FILTER_MANAGE_TYPE.SELECTED:
				this.filteredRows = _.filter( this._bkRows, ( row: Row ) => {
					return !_.includes( this.popupContext.itemIDs, row.id );
				} );
				break;
		}

		if ( this.itemName ) this.searchItem( this.itemName );

		this._cdRef.markForCheck();
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	protected onRowSelected( rows: Row[] ) {
		this._bkRows =_.cloneDeep( this.filteredRows );
		this.rows = _.cloneDeep( this.filteredRows );

		if ( rows === null ) {
			if ( !this.isCreate ) this.selectedRecord = [];

			return;
		};

		this.selectedRecord = this._mapSelectedItem( rows );
		this.selectedRecord = _.unionBy( this.selectedRecord, 'id' );
	}

	/**
	 * @return {void}
	 */
	protected createNewItem() {
		this.isCreate = true;

		this._setConfig( true );

		this.config.row.actions = undefined;

		this._createRow();
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		if ( this.isCreate ) {
			this.config.row.actions = null;
			this.isCreate = false;
			this.config.mode = SpreadsheetMode.Picker;
			this.newRows = [];
			this.filteredRows = _.cloneDeep( this._bkRows );

			return;
		}

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected addItems() {
		if ( this.isCreate ) {
			this.isCreate = false;

			return;
		}

		const _items: ULID[]
			= _.map( this.selectedRecord, 'id' );

		this.popupContext
		.onItemSelected(
			_.isEqual( this.popupContext.itemIDs, _items )
				? undefined
				: this.selectedRecord
		);

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected onCreateNewItem() {
		this.isLoadingCreateItem = true;

		if ( !this.newRows.length ) {
			this.config.row.actions = null;
			this.selectedFilter = this.FILTER_MANAGE_TYPE.ALL;
			this.isCreate = false;

			this.filterItem( this.FILTER_MANAGE_TYPE.ALL );

			return;
		}

		const socketSessionID: ULID = ulid();
		const _records: ( Pick<RecordData, 'id'> & Partial<Pick<RecordData, 'cells'>> )[]
			= _.map( this.newRows, ( row: Row ) => {
				return {
					id: row.id,
					cells: row.data,
				};
			} );

		this._createRecordWS( socketSessionID );

		this._recordService
		.bulkCreate({
			socketSessionID,
			records: _records,
			boardID: this.popupContext.fieldParams.reference.boardID,
		})
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this.config.row.actions = null;
				this.selectedFilter = this.FILTER_MANAGE_TYPE.ALL;
				this.config.mode = SpreadsheetMode.Picker;
				this.isCreate = false;

				_.forEach(
					this.newRows, ( row: Row ) => {
						row.selected = true;
					}
				);

				this.selectedRecord ||= [];

				this.selectedRecord = [
					...this.selectedRecord,
					...this._mapSelectedItem( this.newRows ),
				];

				this.filteredRows = [ ...this._bkRows, ...this.newRows ];
				this.rows = _.cloneDeep( this.filteredRows );
				this._bkRows = _.cloneDeep( this.filteredRows );
				this.newRows = [];

				setTimeout(() => {
					this._spreadsheetCmp.scrollToCell(
						this.filteredRows[ this.filteredRows.length - 1 ]
					);
				});
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initFields() {
		let boardID: ULID;

		if( this.popupContext?.lookupParams?.sourceBoardID ) {
			boardID = this.popupContext.lookupParams.sourceBoardID;
		} else {
			boardID = this.popupContext.fieldParams.reference.boardID;
		}

		this._boardFieldService
		.get( boardID, true )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fields: BoardField[] ) => {
				if ( !fields.length ) return;

				this.fields = fields;

				if ( this.popupContext?.lookupParams?.sourceBoardID ) {
					this._initConfig();

					this.popupContext.itemIDs.length
						? this._getListDataByBoard()
						: this.isLoadedData = true;

					return;
				}

				this._initRowsID();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initRowsID() {
		this._recordService
		.listIDByView( this.popupContext.fieldParams.reference.viewID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( res: RecordIDByView ) => {
				this._mapRows( res.data );

				this._initConfig();
				this._getListDataByView();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getListDataByView() {
		this._recordService
		.listDataByView(
			this.popupContext.fieldParams.reference.viewID,
			_.map( this.fields, 'id' )
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( records: RecordData[] ) => {
				this.records = records;

				const recordIDs: ULID[] = _.map( records, 'id' );

				this._mapRows( recordIDs );
				this._initRowsData();
			},
		});
	}


	/**
	 * @return {void}
	 */
	private _getListDataByBoard() {
		let boardID: ULID;

		if( this.popupContext?.lookupParams?.sourceBoardID ) {
			boardID = this.popupContext.lookupParams.sourceBoardID;
		} else {
			boardID = this.popupContext.fieldParams.reference.boardID;
		}

		this._recordService
		.listDataByBoard(
			boardID,
			_.map( this.fields, 'id' ),
			_.union(
				[
					...( this.popupContext.itemIDs || [] ),
					..._.map( this.rows, 'id' ),
				]
			)
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( records: RecordData[] ) => {
				this.records = records;

				const recordIDs: ULID[] = _.map( records, 'id' );

				this._mapRows( recordIDs );
				this._initRowsData();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initConfig() {
		this._setConfig();
		this._initColumns();
	}

	/**
	 * @return {void}
	 */
	private _initColumns() {
		const columns: Column[] = [];

		_.forEach( this.fields, ( field: BoardField ) => {
			columns.push( this._initColumnData( field ) );
		} );

		this.columns = columns;
	}

	/**
	 * @param {BoardField} field
	 * @return {void}
	 */
	private _initColumnData(
		field: BoardField
	): Column {
		return {
			id: field.id,
			hidden: field.isHidden,
			width: field.width,
			field: this.fieldHelper.createField( field ),
			highlight:
				field.id
					=== this.popupContext?.lookupParams?.sourceFieldID,
		};
	}

	/**
	 * @return {void}
	 */
	private _createRow() {
		const newRow: Row = _.cloneDeep({
			data: undefined,
			selected: false,
			id: ulid(),
		});

		this.newRows ||= [];

		this.newRows.push( newRow );
	}

	/**
	 * @param {ULID} socketSessionID
	 * @return {void}
	 */
	private _createRecordWS( socketSessionID: ULID ) {
		this._webSocketService
		.on( socketSessionID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( data: { records: RecordData[] } ) => {
				this.records = _.concat( this.records, data.records );

				this._initRowsData(
					_.map(
						this.records,
						( record: RecordData ) => {
							return { id: record.id };
						}
					) as Row[]
				);
			},
		});
	}

	/**
	 * @param {boolean=} isCreateNewItem
	 * @return {void}
	 */
	private _setConfig( isCreateNewItem?: boolean ) {
		let _selectionMode: RowSelectionMode
			= this.popupContext.fieldParams?.isMultipleSelect
				? this.SELECT_TYPE.Multiple
				: this.SELECT_TYPE.Single;

		let _spreadsheetMode: SpreadsheetMode
			= isCreateNewItem
				? SpreadsheetMode.Creator
				: SpreadsheetMode.Picker;

		if ( this.popupContext.readonly ) {
			_selectionMode = this.SELECT_TYPE.None;
			_spreadsheetMode = SpreadsheetMode.Creator;
		}

		this.config = {
			mode: _spreadsheetMode,
			column: {
				calculable: false,
				creatable: false,
				default: {
					editable: false,
				},
			},
			row: {
				size: 'S',
				creatable:  !!isCreateNewItem,
				arrangeable: !!isCreateNewItem,
				expandable: false,
				deleteConfirmation: false,
				selectionMode: _selectionMode,
			},
		};
	}

	/**
	 * @return {ULID}
	 */
	private _getPrimaryFieldID(): ULID {
		return _.find(
			this.columns, ( column: Column ) => !!column.field.isPrimary
		)?.id;
	}

	/**
	 * @param {Row[]} rows
	 * @return {ReferenceRecord[]}
	 */
	private _mapSelectedItem( rows: Row[] ): ReferenceRecord[] {
		return _.map( rows, ( row: Row ) => {
			return {
				id: row.id,
				data: row.data
					? row.data[ this._getPrimaryFieldID() ]
					: null,
			};
		} );
	}

	/**
	 * @return {void}
	 */
	private _initViewDetail() {
		this._dataViewService
		.getDetail( this.popupContext.fieldParams.reference.viewID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( viewDetails: DataViewDetail ) => {
				this.breadCrumbItems = {
					baseName: viewDetails.baseName,
					boardName: viewDetails.boardName,
					viewName: viewDetails.name,
				};

				viewDetails.permissionOnView
					? this._initFields()
					: this.isNoPermission = true;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	private _initRowsData( rows: Row[] = this.rows ) {
		const recordLk: ObjectType<RecordData> = _.keyBy( this.records, 'id' );

		_.forEach( rows, ( row: Row ) => {
			if ( !recordLk[ row.id ] ) return;

			row.data = recordLk[ row.id ].cells;
		} );

		const selectedRows: Row[] = [];

		if (
			!this.isLoadingCreateItem
			&& this.popupContext.itemIDs?.length
		) {
			_.forEach( this.rows, ( row: Row ) => {
				if ( _.includes( this.popupContext.itemIDs, row.id ) ) {
					selectedRows.push( row );
				}
			} );

			this.selectedRecord = this._mapSelectedItem( selectedRows );

			this.selectedRecord
				= _.sortBy(
					this.selectedRecord,
					( item: ReferenceRecord ) => {
						return _.indexOf(
							this.popupContext.itemIDs,
							item.id
						);
					} );
		}

		this._bkRows = _.cloneDeep( this.rows );

		this.popupContext.isExpand || this.popupContext.readonly
			? this.filterItem( this.FILTER_MANAGE_TYPE.SELECT )
			: this.filteredRows = _.cloneDeep( this.rows );

		this.isLoadedData = true;
		this.isLoadingCreateItem = false;

		this._cdRef.markForCheck();
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	private _mapRows( ids: ULID[] ) {
		this.rows = _.map(
			ids,
			( id: ULID ) => {
				return {
					id,
					deletable: false,
					editable: false,
					selected:
						this.popupContext.readonly
							? false
							: _.includes(
								this.popupContext.itemIDs,
								id
							),
				};
			}
		) as Row[];
	}

	/**
	 * @return {void}
	 */
	private _getFieldDetail() {
		this._boardFieldService
		.fieldDetail(
			this.popupContext.lookupParams.sourceFieldID
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fieldDetail: FieldDetail ) => {
				this.breadCrumbItems = {
					baseName: fieldDetail.baseName,
					boardName: fieldDetail.boardName,
				};

				this._initFields();
			},
			error: ( error: IError ) => {
				if ( error.status === 400 ) this.isNoPermission = true;
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getBoardDetail() {
		this._boardService
		.getDetail( this.popupContext.fieldParams.reference.boardID )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( boardDetail: IBoard ) => {
				this.canCreateRecord =
					boardDetail.permission.detail.record.create;

				this._initViewDetail();
			},
			error: ( error: IError ) => {
				if ( error.status === 400 ) this.isNoPermission = true;
			},
		});
	}

}
