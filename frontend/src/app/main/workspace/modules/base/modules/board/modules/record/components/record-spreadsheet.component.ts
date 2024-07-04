import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	ViewContainerRef,
	inject
} from '@angular/core';
import {
	CdkDragDrop,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import {
	Observer,
	Observable,
	Subscription,
	BehaviorSubject
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID,
	ulid
} from 'ulidx';
import {
	executeFilter
} from '@cub/filter';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	Unsubscriber,
	WebSocketService,
	untilCmpDestroyed
} from '@core';

import {
	IError
} from '@error/interfaces';

import {
	CUBScrollBarComponent
} from '@cub/material/scroll-bar';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBPopupComponent,
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	CellDataEditedEvent,
	Config,
	ExportData,
	ROW_SIZES,
	Row,
	RowDuplicatedEvent,
	RowInsertedEvent,
	RowMovedEvent,
	RowSize,
	SpreadsheetComponent
} from '@main/common/spreadsheet/components';
import {
	Column,
	ColumnDuplicatedEvent,
	ColumnInsertedEvent,
	ColumnMovedEvent
} from '@main/common/spreadsheet/components/sub-classes/column';
import {
	ActionAffectFieldInvalid,
	BoardField,
	BoardFieldCreate,
	BoardFieldDuplicate,
	BoardFieldUpdate,
	IBoardPermission
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	BoardPermissionType
} from '@main/workspace/modules/base/modules/role-permission/resources';
import {
	FieldBuilderService
} from '@main/common/field/modules/builder/services';
import {
	CheckboxField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	EmailField,
	Field,
	FormulaField,
	LastModifiedTimeField,
	LinkField,
	NumberField,
	ParagraphField,
	PhoneField,
	ProgressField,
	RatingField,
	TextField,
	FIELD_READONLY,
	ReferenceField,
	DropdownField
} from '@main/common/field/objects';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	IUserData
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	SortingType
} from '@main/common/spreadsheet/helpers/sort';
import {
	DataType,
	DropdownReference,
	ReferenceData,
	ReferenceItem,
	ReferenceLink
} from '@main/common/field/interfaces';

import {
	BoardExpandService,
	BoardFieldService
} from '../../../services';

import {
	FieldLayoutConfig,
	RecordLayoutConfig,
	RecordLayoutDataUpdate
} from '../../view/interfaces';
import {
	FilterComponent
} from '../../filter/components';
import {
	Filter,
	Option
} from '../../filter/interfaces';
import {
	LogicalOperator,
	FilterError
} from '../../filter/resources';
import {
	DataViewDetail
} from '../../view/modules/data-view/interfaces';
import {
	DataViewService
} from '../../view/modules/data-view/services';
import {
	ExportFileService
} from '../../import/services';
import {
	RecordService
} from '../services';
import {
	TRecord,
	RecordData,
	RecordDuplicate,
	RecordPermission,
	RecordUpdate,
	RecordIDByView,
	RecordFilterCode
} from '../interfaces';
import {
	DialogItemChange
} from '../modules/detail/interfaces';

import {
	RecordBase
} from './record-base';

const SORT_TEXT: ReadonlySet<DataType>
	= new Set([
		TextField.dataType,
		CheckboxField.dataType,
		ParagraphField.dataType,
		LinkField.dataType,
		EmailField.dataType,
	]);

const SORT_NUMBER: ReadonlySet<DataType>
	= new Set([
		NumberField.dataType,
		PhoneField.dataType,
		CurrencyField.dataType,
		RatingField.dataType,
		ProgressField.dataType,
	]);

const SORT_DATE: ReadonlySet<DataType>
	= new Set([
		DateField.dataType,
		CreatedTimeField.dataType,
		LastModifiedTimeField.dataType,
	]);

@Unsubscriber()
@Component({
	selector		: 'record-spreadsheet',
	templateUrl		: '../templates/record-spreadsheet.pug',
	styleUrls		: [ '../styles/record-spreadsheet.scss' ],
	host			: { class: 'record-spreadsheet' },
	// eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
	inputs			: [ ...RecordBase.inputsMetadata ],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class RecordSpreadsheetComponent
	extends RecordBase
	implements OnInit {

	@ViewChild( SpreadsheetComponent )
	protected spreadsheetCmp: SpreadsheetComponent;
	@ViewChild( 'sortFieldsScrollBar' )
	private _sortFieldsScrollBar: CUBScrollBarComponent;
	@ViewChild( 'groupFieldsScrollBar' )
	private _groupFieldsScrollBar: CUBScrollBarComponent;
	@ViewChild( 'deleteFieldPopup' )
	private _deleteFieldPopup: CUBPopupComponent;

	protected readonly ROW_SIZES: readonly RowSize[]
		= ROW_SIZES;
	protected readonly SORT_TEXT: typeof SORT_TEXT
		= SORT_TEXT;
	protected readonly SORT_NUMBER: typeof SORT_NUMBER
		= SORT_NUMBER;
	protected readonly SORT_DATE: typeof SORT_DATE
		= SORT_DATE;
	protected readonly boardPermissionType: typeof BoardPermissionType
		= BoardPermissionType;

	protected config: Config;
	protected boardPermission: IBoardPermission;
	protected filterPopup: CUBPopupRef;
	protected filterStatus: {
		invalid?: boolean;
		viewNotFoundData?: boolean;
		spreadsheetNotFoundData?: boolean;
	};
	protected columns: Column[];
	protected sortingColumns: Column[];
	protected groupingColumns: Column[];
	protected rows: Row[];
	protected filter: Filter;
	protected isDeleteField: boolean;

	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _hasRecordIDs: BehaviorSubject<boolean>
		= new BehaviorSubject<boolean>( false );
	private readonly _hasData: BehaviorSubject<boolean>
		= new BehaviorSubject<boolean>( false );
	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _fieldBuilderService: FieldBuilderService
		= inject( FieldBuilderService );
	private readonly _webSocketService: WebSocketService
		= inject( WebSocketService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _boardExpandService: BoardExpandService
		= inject( BoardExpandService );
	private readonly _dataViewService: DataViewService
		= inject( DataViewService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _exportFileService: ExportFileService
		= inject( ExportFileService );

	private _userID: ULID;
	private _rowsBk: Row[] = [];

	ngOnInit() {
		this.boardPermission = this.board.permission;

		this._initSubscription();

		this._recordService.exportFile$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( viewName: string ) => {
			this._exportFileService
			.exportXlsx(
				viewName,
				this.spreadsheetCmp.rows,
				this.spreadsheetCmp.displayingColumns
			);
		} );
	}

	/**
	 * @param {ElementRef} origin
	 * @return {void}
	 */
	protected openSpreadsheetFilter(
		origin: ElementRef
	) {
		this.filterPopup
			= this._popupService.open(
				origin,
				FilterComponent,
				{
					isRealtime: true,
					filter: this.filter,
					fields: _.map( this.columns, 'field' ),
					onSave: this._applySpreadsheetFilter.bind( this ),
				},
				{
					hasBackdrop: 'transparent',
					position: 'start-below',
				}
			);

		this.filterPopup
		.afterClosed()
		.subscribe( () => this.cdRef.markForCheck() );
	}

	/**
	 * @return {void}
	 */
	protected openViewFilter() {
		this._popupService.open(
			null,
			FilterComponent,
			{
				filter: this._getFilter( this.view.id ),
				fields: _.map( this.columns, 'field' ),
				onSave: this._updateViewFilter.bind( this ),
			},
			{
				hasBackdrop: 'transparent',
			}
		);
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onColumnAdded( column: Column ) {
		this._addedColumn( column );
	}

	/**
	 * @param {ColumnInsertedEvent} event
	 * @return {void}
	 */
	protected onColumnInserted( event: ColumnInsertedEvent ) {
		this._addedColumn( event.column, event.position );
	}

	/**
	 * @param {ColumnDuplicatedEvent} event
	 * @return {void}
	 */
	protected onColumnDuplicated( event: ColumnDuplicatedEvent ) {
		event.column.editable = false;

		const data: BoardFieldDuplicate = {
			newFieldID: event.column.id,
			name: event.column.field.name,
			isDuplicateValue: event.isDuplicateValue,
		};

		this.boardFieldService
		.duplicate( event.sourceColumn.id, data )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this.updateLayoutData({
					fields: [{
						id: event.column.id,
						position: event.position,
					}],
				});

				if (
					!event.isDuplicateValue
					&& !FIELD_READONLY.has( event.column.field.dataType )
				) {
					this._getRowsPermission( [ data.newFieldID ], false );
					return;
				}

				this._getRowsData( [ data.newFieldID ], false );

				if ( !FIELD_READONLY.has( event.column.field.dataType ) ) {
					this._getRowsPermission([ data.newFieldID ]);
				}
			},
		});
	}

	/**
	 * @param {Column | Column[]} column
	 * @return {void}
	 */
	protected onColumnDeleted( column: Column | Column[] ) {
		const columnIDs: ULID[] = _.isArray( column )
			? _.map( column, 'id' )
			: [ column.id ];

		const columnsBk: Column[] = _.cloneDeep( this.columns );

		_.forEach( columnIDs, ( id: ULID ) => {
			_.remove( this.columns, { id } );
		} );

		this._deleteFieldOb( columnIDs )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				this.columns = columnsBk;

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Column[]} columns
	 * @param {boolean=} isHidden
	 * @return {void}
	 */
	protected onColumnSwitchHide(
		columns: Column[],
		isHidden: boolean = true
	) {
		this.updateLayoutData({
			fields: _.map(
				columns,
				( column: Column ) => { return { id: column.id, isHidden }; }
			),
		});
	}

	/**
	 * @param {number} event
	 * @return {void}
	 */
	protected onColumnFreezed( event: number ) {
		this.viewLayout.field.frozenIndex
			= this.config.column.frozenIndex
			= event;

		this.onThrottleUpdateLayout();
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onColumnResized( column: Column ) {
		const field: BoardField = _.find( this.fields, { id: column.id } );

		if ( field ) field.width = column.width;

		this.updateLayoutData({
			fields: [
				{
					id: column.id,
					width: column.width,
				},
			],
		});
	}

	/**
	 * @param {ColumnMovedEvent} event
	 * @return {void}
	 */
	protected onColumnMoved( event: ColumnMovedEvent ) {
		this.updateLayoutData({
			fields: [{
				id: event.column.id,
				position: event.position,
			}],
		});
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onColumnFieldEdited( column: Column ) {
		const isInvalidBk: boolean
			= column.field.isInvalid;
		const updateData: BoardFieldUpdate = {
			name: column.field.name,
			isRequired: column.field.isRequired,
			description: column.field.description || '',
			params: column.field.toJson()?.params,
			initialData: column.field.initialData,
		};

		if ( column.field.isInvalid ) {
			column.field.isInvalid = false;

			this.spreadsheetCmp.markForCheck();
		}

		this._updateFieldOb(
			column.id,
			updateData,
			column.field.dataType
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				column.field.isInvalid = isInvalidBk;

				this.spreadsheetCmp.markForCheck();
			},
		});
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected onRowAdded( row: Row ) {
		this._addedRow( row );
	}

	/**
	 * @param {RowInsertedEvent} event
	 * @return {void}
	 */
	protected onRowInserted( event: RowInsertedEvent ) {
		this._addedRow( event.row, event.position );
	}

	/**
	 * @param {RowMovedEvent} event
	 * @return {void}
	 */
	protected onRowMoved( event: RowMovedEvent ) {
		const data: RecordLayoutDataUpdate[] = [];

		_.forEach(
			event.rows,
			( row: Row, index: number ) => {
				data.push({
					id: row.id,
					position: event.position + index,
				});
			}
		);

		this.updateLayoutData({ records: data });

		if ( this._rowsBk?.length === this.rows?.length ) {
			this._rowsBk = _.cloneDeep( this.rows );
		} else {
			_.forEach(
				data,
				( config: RecordLayoutConfig ) => {
					if ( config.position < 0 ) return;

					const currentPosition: number
						= _.findIndex(
							this._rowsBk,
							{ id: config.id }
						);
					const row: Row
						= this._rowsBk[ currentPosition ];

					if ( currentPosition < 0 ) return;

					this._rowsBk.splice( currentPosition, 1 );
					this._rowsBk.splice( config.position, 0, row );
				}
			);
		}
	}

	/**
	 * @param {RowDuplicatedEvent} event
	 * @return {void}
	 */
	protected onRowDuplicated( event: RowDuplicatedEvent ) {
		const socketSessionID: ULID = ulid();
		const createdTimeField: BoardField
			= _.find(
				this.fields,
				{ dataType: CreatedTimeField.dataType }
			);
		const data: RecordDuplicate = {
			socketSessionID,
			boardID: this.board.id,
			records: [{
				id: event.sourceRow.id,
				newID: event.row.id,
			}],
		};

		if ( createdTimeField ) {
			event.row.data[ createdTimeField.id ] = moment();
		}

		this._createRecordWS( socketSessionID );

		this._recordService
		.bulkDuplicate( data )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._initRows(
					undefined,
					[{
						id: event.row.id,
					}] as Row[]
				);

				this.updateLayoutData({
					records: [{
						id: event.row.id,
						position: event.position,
					}],
				});
			},
		});
	}

	/**
	 * @param {Row[]} rows
	 * @return {void}
	 */
	protected onRowDeleted( rows: Row[] ) {
		const ids: ULID[] = _.map( rows, 'id' );

		this._recordService
		.bulkDelete(
			this.board.id,
			ids
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				let hasRemoved: boolean;

				this
				._recordService
				.deleteRecords$
				.next( ids );

				_.forEach(
					ids,
					( id: ULID ) => {
						const removed: RecordLayoutConfig[]
							= _.remove(
								this.viewLayout.record.records,
								{ id }
							);

						if ( !hasRemoved ) hasRemoved = !!removed?.length;

						_.remove(
							this._rowsBk,
							{ id }
						);
					}
				);

				if ( hasRemoved ) {
					this.onThrottleUpdateLayout();
				}
			},
		});
	}

	/**
	 * @param {Row} row
	 * @return {void}
	 */
	protected onRowExpanded( row: Row ) {
		const _itemList: ULID[] = _.map( this.rows, 'id' );

		this._boardExpandService
		.openDialogItemDetail({
			itemID: row.id,
			viewID: this.view.id,
			fields: this.fields,
			itemIDs: _itemList,
		});
	}

	/**
	 * @return {void}
	 */
	protected createRecord() {
		this.spreadsheetCmp.addRow();
	}

	/**
	 * @param {RowSize} size
	 * @return {void}
	 */
	protected setRowSize( size: RowSize ) {
		this.config.row.size
			= this.viewLayout.record.size
			= size;

		this.spreadsheetCmp.setRowSize( size );

		this.onThrottleUpdateLayout();
	}

	/**
	 * @param {CellDataEditedEvent[]} data
	 * @return {void}
	 */
	protected onCellDataEdited(
		data: CellDataEditedEvent[]
	) {
		let updatedCells: Record<BoardField[ 'id' ], any> = {};
		const rowLk: Record<ULID, Row>
			= _.keyBy( this._rowsBk, 'id' );
		const updateData: RecordUpdate = {
			boardID: this.board.id,
			records: [],
		};

		_.forEach( data, ( d: CellDataEditedEvent ) => {
			updatedCells = {
				...updatedCells,
				...d.newData,
			};

			updateData.records.push({
				id: d.row.id,
				cells: d.newData,
			});

			rowLk[ d.row.id ] ||= {} as Row;

			rowLk[ d.row.id ].data
				= {
					...rowLk[ d.row.id ].data,
					...d.newData,
				};
		});

		this._recordService
		.bulkUpdate( updateData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				if ( _.isStrictEmpty( updatedCells ) ) return;

				const updatedFieldIDs: ULID[] = _.reduce(
					_.filter(
						this.fields,
						{ dataType: FormulaField.dataType }
					),
					( fieldIDs: ULID[], field: BoardField ) => {
						if ( updatedCells[ field.id ] ) {
							fieldIDs.push( field.id );
						}

						return fieldIDs;
					}, [] );

				if ( !updatedFieldIDs.length ) return;

				this._getRowsData( updatedFieldIDs );
			},
		});
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onFieldSwitchHide( column: Column ) {
		column.hidden
			? this.spreadsheetCmp.unhideColumn( column )
			: this.spreadsheetCmp.hideColumn( column );

		this.cdRef.markForCheck();
		this.onColumnSwitchHide( [ column ], column.hidden );
	}

	/**
	 * @param {CdkDragDrop<BoardField[]>} event
	 * @return {void}
	 */
	protected onFieldDropped(
		event: CdkDragDrop<BoardField[]>
	) {
		if ( event.currentIndex === event.previousIndex ) return;

		const newIndex: number = event.currentIndex + 1;

		this.spreadsheetCmp.moveColumn(
			event.item.data,
			newIndex
		);

		this.spreadsheetCmp.markForCheck();

		this.updateLayoutData({
			fields: [{
				id: event.item.data.id,
				position: newIndex,
			}],
		});
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected removeField( column: Column ) {
		this._confirmService
		.open(
			'BASE.BOARD.RECORD.MESSAGE.DELETE_FIELD_CONFIRM',
			'BASE.BOARD.RECORD.LABEL.DELETE_FIELD',
			{
				warning: true,
				buttonDiscard: 'BASE.BOARD.RECORD.LABEL.KEEP',
				translate: { fieldName: column.field.name },
				buttonApply: {
					text: 'BASE.BOARD.RECORD.LABEL.DELETE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				_.remove( this.columns, { id: column.id } );

				this.columns = _.cloneDeep( this.columns );

				this.cdRef.markForCheck();

				this._deleteFieldOb([ column.id ])
				.pipe( untilCmpDestroyed( this ) )
				.subscribe();
			},
		});
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected editField( column: Column ) {
		this._fieldBuilderService.build(
			column.field,
			this.fieldSettingsMenuTriggerFor.overlayRef.overlayElement,
			_.reject( this.otherFields, { id: column.id } ),
			this.context,
			this.onFieldEdited.bind( this, column ),
			undefined,
			{
				position: 'start-after',
			}
		);
	}

	/**
	 * @param {Column} column
	 * @param {Field} field
	 * @return {void}
	 */
	protected onFieldEdited( column: Column, field: Field ) {
		field.params = field.toJson()?.params;
		column.field = field;

		this.onColumnFieldEdited( column );
	}

	/**
	 * @param {ExportData} e
	 * @return {void}
	 */
	protected onExport(
		e: ExportData
	) {
		this._exportFileService
		.exportXlsx(
			this.view.name,
			e.rows,
			e.columns
		);
	}

	/**
	 * @override
	 * @return {void}
	 */
	protected initFields() {
		this._initConfig();
		this._getRowsData( _.map( this.fields, 'id' ) );
		this._checkAndGetCellPermission();
	}

	/**
	 * @override
	 * @return {void}
	 */
	protected initRecords() {
		this._initRowsID();
	}

	/**
	 * @param {Column} newColumn
	 * @param {Column=} oldColumn
	 * @param {number=} index
	 * @return {void}
	 */
	protected addSortBy(
		newColumn: Column,
		oldColumn?: Column,
		index?: number
	) {
		if ( newColumn.id === oldColumn?.id ) {
			return;
		}

		if ( oldColumn ) {
			this.sortingColumns[ index ] = newColumn;

			this.sortBy(
				newColumn,
				undefined,
				oldColumn
			);
			return;
		}

		this.sortingColumns ||= [];

		this.sortingColumns.push(
			newColumn
		);
		this.sortBy(
			newColumn
		);

		setTimeout(
			() =>this
			._sortFieldsScrollBar
			?.scrollToBottom(),
			100
		);
	}

	/**
	 * @param {Column} column
	 * @param {SortingType=} sortingType
	 * @param {Column=} replaceColumn
	 * @return {void}
	 */
	protected sortBy(
		column: Column,
		sortingType: SortingType = 'asc',
		replaceColumn?: Column
	) {
		if ( !column
			|| !sortingType
			|| column.sortingType === sortingType ) {
			return;
		}

		this
		.spreadsheetCmp
		.sortByColumn(
			column,
			sortingType,
			replaceColumn
		);
	}

	/**
	 * @param {Column} column
	 * @param {number} index
	 * @return {void}
	 */
	protected unSortByColumn(
		column: Column,
		index: number
	) {
		if ( !column ) return;

		this.sortingColumns.splice(
			index,
			1
		);

		this.spreadsheetCmp.unsortByColumn(
			column
		);
	}

	/**
	 * @param {CdkDragDrop<Column[]>} event
	 * @return {void}
	 */
	protected onSortByDropped(
		event: CdkDragDrop<Column[]>
	) {
		if (
			event.currentIndex === event.previousIndex
		) return;

		moveItemInArray(
			event.container.data,
			event.previousIndex,
			event.currentIndex
		);

		this
		.spreadsheetCmp
		.sort( this.sortingColumns );
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onColumnSorted( column: Column ) {
		const sortedColumn: Column
			= _.find( this.sortingColumns, { id: column.id } );

		if ( sortedColumn ) return;

		this.sortingColumns ||= [];

		this.sortingColumns.push(
			column
		);
	}

	/**
	 * @param {Column} newColumn
	 * @param {Column=} oldColumn
	 * @param {number=} index
	 * @return {void}
	 */
	protected addGroupBy(
		newColumn: Column,
		oldColumn?: Column,
		index?: number
	) {
		if ( newColumn.id === oldColumn?.id ) {
			return;
		}

		if ( oldColumn ) {
			this.groupingColumns[ index ] = newColumn;

			this.groupBy(
				newColumn,
				undefined,
				oldColumn
			);
			return;
		}

		this.groupingColumns ||= [];

		this.groupingColumns.push(
			newColumn
		);
		this.groupBy(
			newColumn
		);

		setTimeout(
			() =>this
			._groupFieldsScrollBar
			?.scrollToBottom(),
			100
		);
	}

	/**
	 * @param {Column} column
	 * @param {SortingType=} groupingType
	 * @param {Column=} replaceColumn
	 * @return {void}
	 */
	protected groupBy(
		column: Column,
		groupingType: SortingType = 'asc',
		replaceColumn?: Column
	) {
		if ( !column
			|| !groupingType ) {
			return;
		}

		this
		.spreadsheetCmp
		.groupByColumn(
			column,
			groupingType,
			replaceColumn
		);
	}

	/**
	 * @param {Column} column
	 * @param {number} index
	 * @return {void}
	 */
	protected unGroupByColumn(
		column: Column,
		index: number
	) {
		if ( !column ) return;

		this.groupingColumns.splice(
			index,
			1
		);

		this.spreadsheetCmp.ungroupByColumn(
			column
		);
	}

	/**
	 * @param {CdkDragDrop<Column[]>} event
	 * @return {void}
	 */
	protected onGroupByDropped(
		event: CdkDragDrop<Column[]>
	) {
		if (
			event.currentIndex === event.previousIndex
		) return;

		moveItemInArray(
			event.container.data,
			event.previousIndex,
			event.currentIndex
		);

		this
		.spreadsheetCmp
		.group( this.groupingColumns );
	}

	/**
	 * @param {Column} column
	 * @return {void}
	 */
	protected onColumnGrouped( column: Column ) {
		const groupedColumn: Column
			= _.find(
				this.groupingColumns,
				{ id: column.id }
			);

		if ( groupedColumn ) return;

		this.groupingColumns ||= [];

		this.groupingColumns.push(
			column
		);
	}

	/**
	 * @return {void}
	 */
	private _initColumns() {
		const columns: Column[] = [];

		_.forEach( this.fields, ( field: BoardField ) => {
			if ( field.isPrimary ) {
				columns.unshift( this._initColumnData( field ) );
			} else {
				columns.push( this._initColumnData( field ) );
			}
		} );

		this.columns = columns;
	}

	/**
	 * @param {BoardField} field
	 * @return {void}
	 */
	private _initColumnData( field: BoardField ): Column {
		return {
			...this._initColumnBasicData( field ),
			id: field.id,
			editable: field.canEditAllRow
				&& !FIELD_READONLY.has( field.dataType ),
			deletable: !field.isPrimary
				&& this.boardPermission.detail.field.createAndManage,
		};
	}

	/**
	 * @param {BoardField} field
	 * @return {void}
	 */
	private _initColumnBasicData(
		field: BoardField
	): Pick<Column, 'hidden' | 'width' | 'field'>{
		return {
			hidden: field.isHidden,
			width: field.width,
			field: this.fieldHelper.createField( field ),
		};
	}

	/**
	 * @return {void}
	 */
	private _initRowsID() {
		this.recordService
		.listIDByView( this.context.viewID )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( res: RecordIDByView ) => {
				if ( res.code === FilterError.FILTER_INVALID ) {
					this.filterStatus ||= {};

					this.filterStatus.invalid = true;
					return;
				}

				if ( res.code === RecordFilterCode.HAS_FILTER
					&& !res.data?.length ) {
					this.filterStatus ||= {};

					this.filterStatus.viewNotFoundData = true;
				}

				const ids: ULID[] = res.data;

				_.forEach(
					this.viewLayout.record.records,
					( config: RecordLayoutConfig ) => {
						if ( config.position < 0 ) return;

						const currentPosition: number
							= ids.indexOf( config.id );

						if ( currentPosition < 0 ) return;

						ids.splice( currentPosition, 1 );
						ids.splice( config.position, 0, config.id );
					}
				);

				this.rows = _.map(
					ids,
					( id: ULID ) => {
						return { id, deletable: false };
					}
				) as Row[];

				this._hasRecordIDs.next( true );
			},
		});
	}

	/**
	 * @param {RecordData[]} records
	 * @param {Row[]=} rows
	 * @return {void}
	 */
	private _initRowsData(
		records: RecordData[],
		rows: Row[] = this.rows
	) {
		const recordLk: Record<TRecord[ 'id' ], RecordData>
			= _.keyBy( records, 'id' );

		_.forEach( rows, ( row: Row ) => {
			if ( !recordLk[ row.id ] ) return;

			row.data = {
				...row.data,
				...recordLk[ row.id ].cells,
			};
			row.deletable = recordLk[ row.id ].permission?.delete;
		} );

		this.spreadsheetCmp.updateRows( rows );

		this._rowsBk = [
			...rows,
		];

		this._applySpreadsheetFilter( this.filter || undefined );
	}

	/**
	 * @param {Record<BoardField[ 'id' ], RecordPermission>} records
	 * @return {void}
	 */
	private _initRowsPermission(
		records: Record<BoardField[ 'id' ], RecordPermission>
	) {
		_.forEach( this.rows, ( row: Row ) => {
			if ( !records[ row.id ] ) return;

			row.editable = _.isStrictEmpty( records[ row.id ] )
				? false
				: records[ row.id ];
		} );

		this.spreadsheetCmp.updateRows( this.rows );
	}

	/**
	 * @param {TRecord[]} records
	 * @param {Row[]=} rows
	 * @return {void}
	 */
	private _initRows( records: TRecord[], rows?: Row[] ) {
		const recordLk: Record<TRecord[ 'id' ], TRecord>
			= _.keyBy( records, 'id' );
		let rowsLk: Record<Row[ 'id' ], Row>;

		if ( rows?.length ) {
			rowsLk = _.keyBy( this.rows, 'id' );
		} else {
			rows = this.rows;
		}

		_.forEach(
			rows,
			( row: Row ) => {
				if ( !recordLk[ row.id ] ) return;

				row.deletable = !!recordLk[ row.id ].permission?.delete;
				row.data = {
					...row.data,
					...recordLk[ row.id ].cells,
				};

				if ( rowsLk ) {
					rowsLk[ row.id ].data = row.data;
				}
			}
		);

		this.spreadsheetCmp.updateRows( rows );

		this._rowsBk = [
			...this._rowsBk,
			...rows,
		];
	}

	/**
	 * @return {void}
	 */
	private _initConfig() {
		this.config = {
			row: {
				size: this.viewLayout.record.size || 'S',
				creatable: !!this.boardPermission.detail.record.create,
				arrangeable: this.boardPermission.type
					=== this.boardPermissionType.FULL_PERMISSION,
				expandable: true,
				exportable: true,
				default: { editable: false } as Row,
			},
			column: {
				...(
					this.boardPermission.detail.field.createAndManage
						? {
							creatable: true,
							resizable: true,
							freezable: true,
							manageable: true,
						}
						: {
							creatable: false,
							resizable: false,
							freezable: false,
							manageable: false,
						}
				),
				groupable: true,
				sortable: true,
				deleteConfirmation: this._deleteConfirmation(),
				minResizeWidth: 100,
				frozenIndex: this.viewLayout.field.frozenIndex,
				default: {
					editable: false,
				} as Column,
			},
		};

		this._initColumns();
	}

	/**
	 * @return {Observable}
	 */
	private _deleteConfirmation(): Observable<boolean> {
		return new Observable(
			( observer: Observer<boolean> ) => {
				const deleteFieldPopup: CUBPopupRef
					= this._popupService
					.open(
						null,
						this._deleteFieldPopup,
						undefined,
						{
							viewContainerRef: this._vcRef,
							hasBackdrop: true,
						}
					);

				deleteFieldPopup
				.afterClosed()
				.subscribe({
					next: () => {
						observer.next( this.isDeleteField );

						this.isDeleteField = false;

						observer.complete();
					},
					error: ( err: IError ) => observer.error( err ),
				});
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this
		.boardFieldService
		.fieldsAdded$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				const columns: Column[] = [];

				_.forEach( fields, ( field: BoardField ) => {
					columns.push( this._initColumnData( field ) );
				} );

				this.spreadsheetCmp.pushColumns( columns );

				setTimeout(
					() => this.fieldSettingsScrollBar?.scrollToBottom()
				);

				this.cdRef.markForCheck();
				this.spreadsheetCmp.markForCheck();
			},
		});

		this
		._dataViewService
		.filterUpdated$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.initRecords();
				this._getRowsData( _.map( this.fields, 'id' ), true );
			},
		});

		this
		._userService
		.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( userData: IUserData ) => this._userID = userData.user.id,
		});

		this
		._recordService
		.detailItemChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( itemChange: DialogItemChange ) => {
				switch ( itemChange.type ) {
					case 'delete':
						this.rows = _.reject(
							this.rows,
							{ id: itemChange.data }
						);

						this
						._recordService
						.deleteRecords$
						.next([ itemChange.data ]);
						break;
					case 'update':
						const row: Row
							= _.find(
								this.rows,
								{ id: itemChange.data.recordID }
							);

						if ( !row ) return;

						if ( _.isUndefined( itemChange.data?.index ) ) {
							row.data[ itemChange.data.fieldID ]
								= itemChange.data.cellValue;
						} else {
							row.data[ itemChange.data.fieldID ]
							.selected[ itemChange.data.index ]
								= itemChange.data.cellValue;
						}

						this.spreadsheetCmp.updateRows( this.rows );
						break;
				}

				this.cdRef.markForCheck();
			},
		});

		this
		._recordService
		.deleteRecords$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( ids: ULID[] ) => {
				const idsLk: Record<ULID, ULID>
					= _.keyBy( ids );
				const columnLk: Record<ULID, Column>
					= _.keyBy( this.columns, 'id' );
				const fieldBkLk: Record<ULID, BoardField>
					= _.keyBy( this.fieldsBackup, 'id' );
				const resetFieldIdsData: ULID[] = [];
				const idsSet: ReadonlySet<ULID>
					= new Set( ids );

				_.forEach(
					this.fields,
					( f: BoardField ) => {
						switch ( f.dataType ) {
							case ReferenceField.dataType:
								// field
								const fRefInitialData: ReferenceData
									= f.initialData;

								if ( fRefInitialData ) {
									_.pull(
										fRefInitialData.value,
										...ids
									);
									_.remove(
										fRefInitialData.selected,
										( i: ReferenceItem ) => !!idsLk[ i.id ]
									);
								}

								// field backup
								const fBkRefInitialData: ReferenceData
									= fieldBkLk[ f.id ].initialData;

								if ( fBkRefInitialData ) {
									_.pull(
										fBkRefInitialData.value,
										...ids
									);
									_.remove(
										fBkRefInitialData.selected,
										( i: ReferenceItem ) => !!idsLk[ i.id ]
									);
								}

								// column
								const cRefInitialData: ReferenceData
									= columnLk[ f.id ].field.initialData;

								if ( cRefInitialData ) {
									_.pull(
										cRefInitialData.value,
										...ids
									);
									_.remove(
										cRefInitialData.selected,
										( i: ReferenceItem ) => !!idsLk[ i.id ]
									);
								}

								// row
								resetFieldIdsData.push( f.id );
								break;
						}
					}
				);

				_.forEach(
					resetFieldIdsData,
					( id: ULID ) => {
						_.forEach(
							this.rows,
							( row: Row ) => {
								if (
									!row.data?.[ id ]?.value?.some(
										( r: ULID ) => idsSet.has( r )
									)
								) {
									return;
								}

								row.data[ id ] = {
									value: _.pull(
										row.data[ id ].value,
										...ids
									),
									selected: _.reject(
										row.data[ id ].selected,
										( i: ReferenceItem ) => !!idsLk[ i.id ]
									),
								};
							}
						);
						_.forEach(
							this._rowsBk,
							( rowBk: Row ) => {
								if (
									!rowBk.data?.[ id ]?.value?.some(
										( r: ULID ) => idsSet.has( r )
									)
								) {
									return;
								}

								rowBk.data[ id ] = {
									value: _.pull(
										rowBk.data[ id ].value,
										...ids
									),
									selected: _.reject(
										rowBk.data[ id ].selected,
										( i: ReferenceItem ) => !!idsLk[ i.id ]
									),
								};
							}
						);
					}
				);

				this
				.spreadsheetCmp
				.updateRows( this.rows );

				this.spreadsheetCmp.markForCheck();
			},
		});

		this
		._boardFieldService
		.actionAffectFieldInvalid$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( action: ActionAffectFieldInvalid ) => {
				const fieldBkLk: Record<ULID, BoardField>
					= _.keyBy( this.fieldsBackup, 'id' );
				const columnLk: Record<ULID, Column>
					= _.keyBy( this.columns, 'id' );
				const resetFieldData: ULID[] = [];

				_.forEach(
					this.fields,
					( f: BoardField ) => {
						switch ( f.dataType ) {
							case ReferenceField.dataType:
								// column
								const cReferenceLink: ReferenceLink
								= (
									columnLk[ f.id ]
									.field as ReferenceField
								).reference;

								if ( cReferenceLink ) {
									if (
										cReferenceLink.boardID
											=== action.boardId
										|| cReferenceLink.viewID
											=== action.viewId
									) {
										columnLk[ f.id ].field.isInvalid
											= true;
										columnLk[ f.id ].field.initialData
											= null;

										resetFieldData.push( f.id );
									}

									// if (
									// 	cReferenceLink.baseID === action.baseId
									// ) {
									// 	cReferenceLink.baseID
									// 		= cReferenceLink.boardID
									// 		= cReferenceLink.viewID
									// 		= null;
									// }
									if (
										cReferenceLink.boardID
											=== action.boardId
									) {
										cReferenceLink.boardID
											= cReferenceLink.viewID
											= null;
									}
									if (
										cReferenceLink.viewID === action.viewId
									) {
										cReferenceLink.viewID = null;
									}
								}

								// field
								const fReferenceLink: ReferenceLink
									= (
										f.params as ReferenceField
									).reference;

								if ( fReferenceLink ) {
									if (
										fReferenceLink.boardID
											=== action.boardId
										|| fReferenceLink.boardID
											=== action.boardId
									) {
										f.isInvalid = true;
										f.initialData = null;
									}

									// if (
									// 	fReferenceLink.baseID === action.baseId
									// ) {
									// 	fReferenceLink.baseID
									// 		= fReferenceLink.boardID
									// 		= fReferenceLink.viewID
									// 		= null;
									// }
									if (
										fReferenceLink.boardID
											=== action.boardId
									) {
										fReferenceLink.boardID
											= fReferenceLink.viewID
											= null;
									}
									if (
										fReferenceLink.viewID === action.viewId
									) {
										fReferenceLink.viewID = null;
									}
								}

								// fieldBk
								const fBkReferenceLink: ReferenceLink
									= (
										fieldBkLk[ f.id ]
										.params as ReferenceField
									).reference;

								if ( fBkReferenceLink ) {
									if (
										fBkReferenceLink.boardID
											=== action.boardId
										|| fBkReferenceLink.viewID
											=== action.viewId
									) {
										fieldBkLk[ f.id ].isInvalid = true;
										fieldBkLk[ f.id ].initialData = null;
									}
									// if (
									// 	fBkReferenceLink.baseID
									// 		=== action.baseId
									// ) {
									// 	fBkReferenceLink.baseID
									// 		= fBkReferenceLink.boardID
									// 		= fBkReferenceLink.viewID
									// 		= null;
									// }
									if (
										fBkReferenceLink.boardID
											=== action.boardId
									) {
										fBkReferenceLink.boardID
											= fBkReferenceLink.viewID
											= null;
									}
									if (
										fBkReferenceLink.viewID
											=== action.viewId
									) {
										fBkReferenceLink.viewID = null;
									}
								}
								break;
							case DropdownField.dataType:
								// column
								const cDropdownRef: DropdownReference
									= (
										columnLk[ f.id ]
										.field as DropdownField
									).reference;

								if ( cDropdownRef ) {
									if (
										cDropdownRef.boardID === action.boardId
										|| cDropdownRef.fieldID
											=== action.fieldId
									) {
										columnLk[ f.id ].field.isInvalid
											= true;
										columnLk[ f.id ].field.initialData
											= null;

										resetFieldData.push( f.id );
									}

									if (
										cDropdownRef.boardID === action.boardId
									) {
										cDropdownRef.boardID
											= cDropdownRef.fieldID
											= null;
									}
									if (
										cDropdownRef.fieldID === action.fieldId
									) {
										cDropdownRef.fieldID = null;
									}
								}

								// field
								const fDropdownRef: DropdownReference
									= (
										f.params as DropdownField
									).reference;

								if ( fDropdownRef ) {
									if (
										fDropdownRef.boardID === action.boardId
										|| fDropdownRef.fieldID
											=== action.fieldId
									) {
										f.isInvalid = true;
										f.initialData = null;
									}

									if (
										fDropdownRef.boardID === action.boardId
									) {
										fDropdownRef.boardID
											= fDropdownRef.fieldID
											= null;
									}
									if (
										fDropdownRef.fieldID === action.fieldId
									) {
										fDropdownRef.fieldID = null;
									}
								}

								// fieldBk
								const fBkDropdownRef: DropdownReference
									= (
										fieldBkLk[ f.id ]
										.params as DropdownField
									).reference;

								if ( fBkDropdownRef ) {
									if (
										fBkDropdownRef.boardID
											=== action.boardId
										|| fBkDropdownRef.fieldID
											=== action.fieldId
									) {
										fieldBkLk[ f.id ].isInvalid = true;
										fieldBkLk[ f.id ].initialData = null;
									}
									if (
										fBkDropdownRef.boardID
											=== action.boardId
									) {
										fBkDropdownRef.boardID
											= fBkDropdownRef.fieldID
											= null;
									}
									if (
										fBkDropdownRef.fieldID
											=== action.fieldId
									) {
										fBkDropdownRef.fieldID = null;
									}
								}
								break;
						}
					}
				);

				if ( resetFieldData.length ) {
					this._clearCellDataOnColumn(
						resetFieldData
					);
				}

				this.spreadsheetCmp.markForCheck();
			},
		});
	}

	/**
	 * @param {Column} column
	 * @param {number=} position
	 * @return {void}
	 */
	private _addedColumn(
		column: Column,
		position?: number
	) {
		const createData: BoardFieldCreate = {
			id: column.field.id,
			boardID: this.board.id,
			name: column.field.name,
			dataType: column.field.dataType,
		};

		if ( column.field.description ) {
			createData.description = column.field.description;
		}
		if ( column.field.isRequired ) {
			createData.isRequired = column.field.isRequired;
		}
		if ( !_.isStrictEmpty( column.field.initialData ) ) {
			createData.initialData = column.field.initialData;
		}
		if ( !_.isStrictEmpty( column.field.toJson()?.params ) ) {
			createData.params = column.field.toJson()?.params;
		}

		this.createFieldOb( createData )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._getRowsData( [ column.id ], false );

				if (
					!FIELD_READONLY.has( column.field.dataType )
				) {
					this._getRowsPermission([ column.id ]);
				}

				_.isFinite( position )
					&& this.updateLayoutData({
						fields: [{
							position,
							id: column.id,
						}],
					});
			},
		});
	}

	/**
	 * @param {Row} row
	 * @param {number=} position
	 * @return {void}
	 */
	private _addedRow(
		row: Row,
		position?: number
	) {
		const socketSessionID: ULID = ulid();

		this._createRecordWS( socketSessionID );

		this._recordService
		.bulkCreate({
			socketSessionID,
			records: [{ id: row.id }],
			boardID: this.board.id,
		})
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._initRows(
					undefined,
					[{ id: row.id }] as Row[]
				);

				_.isFinite( position )
					&& this.updateLayoutData({
						records: [{
							position,
							id: row.id,
						}],
					});
			},
		});
	}

	/**
	 * @param {ULID} fieldID
	 * @param {BoardFieldUpdate} data
	 * @param {DataType} dataType
	 * @return {Observable}
	 */
	private _updateFieldOb(
		fieldID: ULID,
		data: BoardFieldUpdate,
		dataType: DataType
	): Observable<BoardField> {
		return new Observable( ( observer: Observer<BoardField> ) => {
			const field: BoardField = _.find( this.fields, { id: fieldID } );

			field && _.assign( field, data );

			this.cdRef.markForCheck();

			this.boardFieldService
			.update( fieldID, data )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( res: BoardField ) => {
					this.fieldsBackup = _.cloneDeep( this.fields );

					if ( dataType === DataType.Lookup ) {
						this._getRowsData( [ fieldID ], false );
					}

					observer.next( res );
					observer.complete();
				},
				error: ( err: IError ) => {
					observer.error( err );

					this.fields = _.cloneDeep( this.fieldsBackup );

					this.cdRef.markForCheck();
				},
			});
		} );
	}

	// /**
	//  * @param {ULID[]} fieldIDs
	//  * @param {BoardFieldUpdate} data
	//  * @return {Observable}
	//  */
	// private _bulkUpdateFieldOb(
	// 	fieldIDs: ULID[],
	// 	data: BoardFieldUpdate
	// ): Observable<BoardField[]> {
	// 	return new Observable( ( observer: Observer<BoardField[]> ) => {
	// 		const fieldsLk: Record<BoardField[ 'id' ], BoardField> = _.keyBy( this.fields, 'id' );

	// 		_.forEach( fieldIDs, ( id: ULID ) => {
	// 			_.assign( fieldsLk[ id ], data );
	// 		} );

	// 		this.cdRef.markForCheck();

	// 		this.boardFieldService
	// 		.bulkUpdate( fieldIDs, data )
	// 		.pipe( untilCmpDestroyed( this ) )
	// 		.subscribe({
	// 			next: ( res: BoardField[] ) => {
	// 				this.fieldsBackup = _.cloneDeep( this.fields );

	// 				observer.next( res );
	// 				observer.complete();
	// 			},
	// 			error: ( err: IError ) => {
	// 				observer.error( err );

	// 				this.fields = _.cloneDeep( this.fieldsBackup );

	// 				this.cdRef.markForCheck();
	// 			},
	// 		});
	// 	} );
	// }

	/**
	 * @param {ULID[]} fieldIDs
	 * @return {Observable}
	 */
	private _deleteFieldOb( fieldIDs: ULID[] ): Observable<void> {
		return new Observable( ( observer: Observer<void> ) => {
			_.forEach( fieldIDs, ( id: ULID ) => {
				_.remove( this.fields, { id } );
			} );

			this.cdRef.markForCheck();

			this.boardFieldService
			.bulkDelete( fieldIDs, this.board.id )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: () => {
					this.fieldsBackup = _.cloneDeep( this.fields );

					let hasRemoved: boolean;

					_.forEach( fieldIDs, ( id: ULID ) => {
						const removed: FieldLayoutConfig[]
							= _.remove(
								this.viewLayout.field.fields,
								{ id }
							);

						if ( !hasRemoved ) hasRemoved = !!removed?.length;
					} );

					hasRemoved && this.onThrottleUpdateLayout();

					if ( this.filter?.options.length ) {
						const columnIDs: ULID[] = _.map( this.columns, 'id' );

						_.forEach( this.filter.options, ( o: Option ) => {
							if ( !_.includes( columnIDs, o.fieldID ) ) {
								_.remove(
									this.filter.options,
									{ fieldID: o.fieldID }
								);
							}
						} );

						this._applySpreadsheetFilter(
							this.filter
						);
					}

					observer.next();
					observer.complete();
				},
				error: ( err: IError ) => {
					this.fields = _.cloneDeep( this.fieldsBackup );

					observer.error( err );
					this.cdRef.markForCheck();
				},
			});
		} );
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
			next: ( data: { records: TRecord[] } ) => {
				this._initRows(
					data.records,
					_.map(
						data.records,
						( record: TRecord ) => {
							return { id: record.id };
						}
					) as Row[]
				);

				this._checkAndGetCellPermission();
			},
		});
	}

	/**
	 * @param {ULID[]} fieldIDs
	 * @param {boolean=} waiting
	 * @return {void}
	 */
	private _getRowsData( fieldIDs: ULID[], waiting: boolean = true ) {
		if ( !fieldIDs?.length ) return;

		this.recordService
		.listDataByView(
			this.context.viewID,
			fieldIDs
		)
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( records: RecordData[] ) => {
				if ( !waiting ) {
					this._initRowsData( records );
					this._hasData.next( true );
					return;
				}

				let initRowsData$: Subscription = null;

				initRowsData$ = this._hasRecordIDs
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: ( v: boolean ) => {
						if ( !v ) return;

						this._initRowsData( records );
						initRowsData$?.unsubscribe();
						this._hasData.next( true );
					},
				});
			},
		});
	}

	/**
	 * @param {ULID[]} fieldIDs
	 * @param {boolean=} waiting
	 * @return {void}
	 */
	private _getRowsPermission(
		fieldIDs: ULID[],
		waiting: boolean = true
	) {
		this.recordService
		.listEditable(
			fieldIDs,
			this.context.viewID
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( p: Record<BoardField[ 'id' ], RecordPermission> ) => {
				if ( !waiting ) {
					this._initRowsPermission( p );
					return;
				}

				let initRowsPermission$: Subscription = null;

				initRowsPermission$ = this._hasData
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: ( v: boolean ) => {
						if ( !v ) return;

						this._initRowsPermission( p );
						initRowsPermission$?.unsubscribe();
					},
				});
			},
		});
	}

	/**
	 * @param {Filter} filter
	 * @return {void}
	 */
	private _applySpreadsheetFilter( filter: Filter ) {
		if ( _.isUndefined( filter ) ) return;

		this.filter = filter;

		if ( !this._rowsBk?.length ) return;

		const fieldsMap: Record<ULID, BoardField>
			= _.keyBy( this.fields, 'id' );

		if ( _.isStrictEmpty( filter )
			|| filter.logicalOperator === LogicalOperator.CUSTOM
				&& !filter.logicalExpression?.length ) {
			this.rows = _.cloneDeep( this._rowsBk );
		} else {
			this.rows = _.map(
				executeFilter(
					_.map(
						this._rowsBk,
						( row: Row ) => {
							return { ...row, cells: row.data };
						}
					),
					filter.conditions as any,
					{
						boardFields: fieldsMap,
						userID: this._userID,
					}
				),
				( row: Row ) => _.omit( row, 'cells' )
			) as Row[];
		}

		this.filterStatus = _.isStrictEmpty( filter )
			? { spreadsheetNotFoundData: false }
			: { spreadsheetNotFoundData: !this.rows?.length };

		this.spreadsheetCmp?.markForCheck();
	}

	/**
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	private _getFilter( viewID: ULID ): Observable<Filter> {
		return new Observable( ( observer: Observer<Filter> ) => {
			this._dataViewService
			.getDetail( viewID )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( view: DataViewDetail ) => {
					observer.next( view.filter );
					observer.complete();
				},
				error: ( e: IError ) => observer.error( e ),
			});
		} );
	}

	/**
	 * @param {Filter} filter
	 * @return {void}
	 */
	private _updateViewFilter( filter: Filter ) {
		this._dataViewService
		.update( this.view.id, { filter } )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.initRecords();
				this._getRowsData(
					_.map( this.fields, 'id' ),
					true
				);
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _checkAndGetCellPermission() {
		const fieldIDs: ULID[] = _.reduce(
			this.fields,
			( ids: ULID[], f: BoardField ) => {
				if (
					!f.canEditAllRow
					&& !FIELD_READONLY.has( f.dataType )
				) ids.push( f.id );

				return ids;
			},
			[]
		);

		if ( !fieldIDs.length ) return;

		this._getRowsPermission( fieldIDs );
	}

	/**
	 * @param {ULID[]} columnIds
	 * @return {void}
	 */
	private _clearCellDataOnColumn(
		columnIds: ULID[]
	) {
		if (
			!this.rows?.length
			|| !columnIds?.length
		) {
			return;
		}

		_.forEach(
			columnIds,
			( id: ULID ) => {
				_.forEach(
					this.rows,
					( row: Row ) => {
						if ( !row.data?.[ id ] ) return;

						row.data[ id ]
							= null;
					}
				);
				_.forEach(
					this._rowsBk,
					( rowBk: Row ) => {
						if ( !rowBk.data?.[ id ] ) return;

						rowBk.data[ id ]
							= null;
					}
				);
			}
		);

		this
		.spreadsheetCmp
		.updateRows( this.rows );
	}

}
