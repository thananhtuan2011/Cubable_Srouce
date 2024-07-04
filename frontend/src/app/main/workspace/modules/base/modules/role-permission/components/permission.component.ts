import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	inject
} from '@angular/core';
import {
	of
} from 'rxjs';
import {
	finalize,
	switchMap
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBSearchBoxComponent
} from '@cub/material/search-box';

import {
	DataType,
	IFieldExtra
} from '@main/common/field/interfaces';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	FIELD_READONLY
} from '@main/common/field/objects';

import {
	View
} from '../../board/modules/view/interfaces';
import {
	ViewType
} from '../../board/modules/view/resources';
import {
	ViewService
} from '../../board/modules/view/services';
import {
	BoardFieldService,
	BoardService
} from '../../board/services';
import {
	IBoard, BoardField
} from '../../board/interfaces';

import {
	RoleService
} from '../services';
import {
	IBoardPermission,
	IBoardPermissionDetail,
	IBoardPermissionElement,
	IFieldsPermission,
	IRole,
	IManageRecordPermission,
	IAssignedRecordPermission,
	IFieldAssignedRowPermission,
	IFieldAccess,
	IFieldManage
} from '../interfaces';
import {
	ActionFieldManageType,
	ActionType,
	BoardPermissionType,
	CONSTANT,
	FieldManageType,
	RecordManageType,
	ViewAccessType,
	ViewManageType
} from '../resources';

interface IField extends Pick<IFieldExtra, 'id' | 'name' | 'dataType'> {
	isSelected?: boolean;
};

interface IViewExtra extends Pick<View, 'id' | 'name' | 'createdBy' | 'type'> {
	isAccess: boolean;
}

@Unsubscriber()
@Component({
	selector: 'permission',
	templateUrl: '../templates/permission.pug',
	styleUrls: [ '../styles/permission.scss' ],
	host: { class: 'permission' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionComponent implements OnInit {

	@ViewChild( CUBSearchBoxComponent )
	public searchBox: CUBSearchBoxComponent;

	@Input() public role: IRole;
	@Input() public users: IUser[];
	@Input() public baseID: ULID;
	@Input() public accessedBoard: IBoardPermission;

	@Output() public isBoardPermissionTypeChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public accessedBoardChange: EventEmitter<IBoardPermission>
		= new EventEmitter<IBoardPermission>();

	public isChangedDetail: boolean;

	protected readonly VIEW_TYPE: typeof ViewType
		= ViewType;
	protected readonly FIELD_READONLY: typeof FIELD_READONLY
		= FIELD_READONLY;
	protected readonly ROLE_UNIQ_NAME: typeof CONSTANT.ROLE_UNIQ_NAME
		= CONSTANT.ROLE_UNIQ_NAME;
	protected readonly FIELD_MANAGE_TYPE: typeof FieldManageType
		= FieldManageType;
	protected readonly RECORD_MANAGE_TYPE: typeof RecordManageType
		= RecordManageType;
	protected readonly ACTION_FIELD_MANAGE_TYPE: typeof ActionFieldManageType
		= ActionFieldManageType;
	protected readonly boardPermissionType: typeof BoardPermissionType
		= BoardPermissionType;
	protected readonly actionType: typeof ActionType
		= ActionType;
	protected readonly viewManageType: typeof ViewManageType
		= ViewManageType;
	protected readonly viewAccessType: typeof ViewAccessType
		= ViewAccessType;

	protected isAllPeopleSelected: boolean;
	protected isAllPeopleOfFieldSelected: boolean;
	protected isAllFieldCanEdit: boolean;
	protected isAllFieldCanView: boolean;
	protected isAllFieldNone: boolean;
	protected isColumnManageShow: boolean;
	protected peopleFieldIdOfRecord: ULID;
	protected peopleFieldIdOfField: ULID;

	protected views: IViewExtra[];
	protected boards: IBoard[];
	protected fields: IFieldAccess[];
	protected peopleFields: IField[];
	protected peopleFieldsOfField: IField[];

	protected peopleFieldsLookup: Record<IField[ 'id' ], IField>;
	protected fieldsLookup: Record<IField[ 'id' ], IField>;

	protected baseRoleDetails: IRole;
	protected permissionDefault: IBoardPermissionElement;
	protected manageRowPermissionDefault: IManageRecordPermission;
	protected allFieldCanEdit: boolean = true;

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardService: BoardService
		= inject( BoardService );
	private readonly _roleService: RoleService
		= inject( RoleService );
	private readonly _viewService: ViewService
		= inject( ViewService );

	private _bkBoards: IBoardPermission[];
	private _peopleFields: IField[];
	private _fields: IFieldAccess[];
	private _views: View[];

	get allViewState(): boolean {
		return _.every(
			this.views,
			( view: IViewExtra ): boolean => view.isAccess
		);
	}

	ngOnInit() {
		this.permissionDefault = {
			type: BoardPermissionType.NO_PERMISSION,
			detail: undefined,
		};

		this.manageRowPermissionDefault = {
			delete: false,
			comment: false,
			editChecklist: false,
			editDescription: false,
			lock: false,
		};

		this._inItBoardPermission();
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	public search( event: string ) {
		if ( !event ) {
			this.role.permissions = _.cloneDeep( this._bkBoards );

			return;
		}

		this.role.permissions
			= _.filter(
				this.role.permissions,
				(
					board: IBoardPermission
				) => _.search( board.boardName, event )
			);
	}

	/**
	 * @return {void}
	 */
	public selectAllView() {
		const allChecked: boolean
			= _.some(
				this.views,
				( view: IViewExtra ) => !view.isAccess
			);

		_.forEach( this.views, ( view: IViewExtra ) => {
			view.isAccess = allChecked;
		} );

		this
		.accessedBoard
		.permission
		.detail
		.view
		.access
		.viewIDs = allChecked
			? _.map( this.views, 'id' )
			: [];
	}

	/**
	 * @param {View} view
	 * @return {void}
	 */
	public onViewChange( view: IViewExtra ) {
		const viewIDs: ULID[]
			= this
			.accessedBoard
			.permission
			.detail
			.view
			.access
			.viewIDs || [];

		view.isAccess
			? _.remove(
				viewIDs,
				( _id: ULID ) => _id === view.id
			)
			: viewIDs.push( view.id );

		view.isAccess = !view.isAccess;
	}

	/**
	 * @param {boolean} checked
	 * @return {void}
	 */
	public changeAllPeopleField(
		checked: boolean
	) {
		_.forEach(
			this.peopleFields,
			( peopleField: IField ) => {
				peopleField.isSelected = checked;
			}
		);
	}

	/**
	 * @param {boolean} checked
	 * @return {void}
	 */
	public changeAllPeopleFieldOfField(
		checked: boolean
	) {
		_.forEach(
			this.peopleFieldsOfField,
			( peopleField: IField ) => {
				peopleField.isSelected = checked;
			}
		);
	}

	/**
	 * @param {IField} peopleField
	 * @param {boolean=} isFromCheckbox
	 * @return {void}
	 */
	public changePeopleField(
		peopleField: IField,
		isFromCheckbox?: boolean
	) {
		if ( !isFromCheckbox ) {
			peopleField.isSelected = !peopleField.isSelected;
		}

		this.isAllPeopleSelected
			= _.reduce(
				this.peopleFields,
				( selectedAll: boolean, f: IField ) => {
					if ( !f.isSelected ) selectedAll = false;

					return selectedAll;
				},
				true
			);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {IField} peopleField
	 * @param {boolean=} isFromCheckbox
	 * @return {void}
	 */
	public changePeopleFieldOfField(
		peopleField: IField,
		isFromCheckbox?: boolean
	) {
		if ( !isFromCheckbox ) {
			peopleField.isSelected = !peopleField.isSelected;
		}

		this.isAllPeopleOfFieldSelected
			= _.reduce(
				this.peopleFieldsOfField,
				( selectedAll: boolean, f: IField ) => {
					if ( !f.isSelected ) selectedAll = false;

					return selectedAll;
				},
				true
			);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {isDeleteAction=} isDeleteAction
	 * @return {void}
	 */
	public onRecordPeopleFieldMenuOpened(
		isDeleteAction?: boolean
	) {
		const permission: IAssignedRecordPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.record
			.manage
			.assignedToThem;

		this.isAllPeopleSelected = false;

		if ( !permission ) return;

		this.peopleFields = _.cloneDeep( this._peopleFields );

		const assignedPeopleIDs: ULID[]
			= _.map(
				permission,
				(
					recordAssignToThem: IAssignedRecordPermission
				) => recordAssignToThem.fieldID
			);

		this.peopleFields
			= _.filter(
				this.peopleFields,
				( peopleField: IField ) =>
					isDeleteAction
						? _.includes( assignedPeopleIDs, peopleField.id )
						: !_.includes( assignedPeopleIDs, peopleField.id )
			);
	}

	/**
	 * @param {isDeleteAction=} isDeleteAction
	 * @return {void}
	 */
	public onColumnPeopleFieldMenuOpened(
		isDeleteAction?: boolean
	) {
		const permission: IFieldAssignedRowPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.field
			.viewAndEdit
			.assignedToThem;
		this.isAllPeopleOfFieldSelected = false;

		this.peopleFieldsOfField = _.cloneDeep( this._peopleFields );

		if ( !permission ) return;

		const assignedPeopleIDs: ULID[]
			= _.map(
				permission,
				(
					recordAssignToThem: IFieldAssignedRowPermission
				) => recordAssignToThem.id
			);

		this.peopleFieldsOfField
			= _.filter(
				this.peopleFieldsOfField,
				( peopleField: IField ) =>
					isDeleteAction
						? _.includes( assignedPeopleIDs, peopleField.id )
						: !_.includes( assignedPeopleIDs, peopleField.id )
			);
	}

	// /**
	//  * @param {IBoardPermission} board
	//  * @return {void}
	//  */
	// public changeAllView( board: IBoardPermission ) {
	// 	let details: IViewAccessDetail[] = board.permission.detail.view.access.details;
	// 	const viewsAccessDetail: IViewAccessDetail[] = _.filter( details, { isAccess: true } );

	// 	details = _.map( details, ( detail: IViewAccessDetail ) => {
	// 		return {
	// 			...detail,
	// 			isAccess: ( viewsAccessDetail.length === details.length ? false : true ),
	// 		};
	// 	} );

	// 	board.permission.detail.view.access.details = details;

	// 	this._cdRef.markForCheck();
	// }

	/**
	 * @return {void}
	 */
	public addRowAssignedRowPermission() {
		let permission: IAssignedRecordPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.record
			.manage
			.assignedToThem;
		const peopleFieldsSelected: IField[]
			= _.filter(
				this.peopleFields,
				{ isSelected: true }
			);

		if ( peopleFieldsSelected.length === 0 ) return;


		_.forEach( peopleFieldsSelected, ( peopleField: IField ) => {
			const assignedToThem: IAssignedRecordPermission = {
				fieldID			: peopleField.id,
				...this.manageRowPermissionDefault,
			};

			permission
				? permission.push( assignedToThem )
				: permission = [ assignedToThem ];
		} );

		this
		.accessedBoard
		.permission
		.detail
		.record
		.manage
		.assignedToThem = permission;
	}

	/**
	 * @param {IFieldAssignedRowPermission[]} permission
	 * @return {void}
	 */
	public addColumnAssignedRowPermission() {
		let permission: IFieldAssignedRowPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.field
			.viewAndEdit
			.assignedToThem;
		const peopleFieldsSelected: IField[]
			= _.filter(
				this.peopleFieldsOfField,
				{ isSelected: true }
			);

		if ( peopleFieldsSelected.length === 0 ) return;

		_.forEach( peopleFieldsSelected, ( peopleField: IField ) => {
			const assignedToThem: IFieldAssignedRowPermission = {
				id: peopleField.id,
				type: ActionFieldManageType.CAN_EDIT_ALL,
				fields: this.fields,
			};

			permission
				? permission.push( assignedToThem )
				: permission = [ assignedToThem ];
		} );

		this
		.accessedBoard
		.permission
		.detail
		.field
		.viewAndEdit
		.assignedToThem = permission;

	}

	/**
	 * @param {number} type
	 * @return {void}
	 */
	public recordManageTypeChanged( type: number ) {
		this.isChangedDetail = true;

		switch ( type ) {
			case RecordManageType.ALL:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.record
					.manage
					.all
				) {
					break;
				}

				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage = { type };
				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage
				.all = this.manageRowPermissionDefault;

				break;
			case RecordManageType.CREATED_BY_THEMSELVES:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.record
					.manage
					.createdByThemselves
				) {
					break;
				}

				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage = { type };
				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage
				.createdByThemselves = this.manageRowPermissionDefault;

				break;
			case RecordManageType.ASSIGNED_TO_THEM:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.record
					.manage
					.assignedToThem
				) {
					break;
				}

				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage = { type };
				this
				.accessedBoard
				.permission
				.detail
				.record
				.manage
				.assignedToThem = [];

				break;
			case RecordManageType.NONE:
				this.accessedBoard.permission.detail.record.manage
					= { type };

				break;
		}
	}

	/**
	 * @param {ActionFieldManageType} actionType
	 * @param {FieldManageType} type
	 * @param {number} index
	 * @return {void}
	 */
	public fieldActionChange(
		actionType: ActionFieldManageType,
		type: FieldManageType,
		index: number
	) {
		let manage: IFieldManage
			= this.accessedBoard.permission.detail.field.viewAndEdit;

		this.isColumnManageShow = false;
		manage
			? manage.type = type
			: manage = { type };

		switch( type ) {
			case FieldManageType.ALL:
				if ( manage.assignedToThem ) {
					manage.assignedToThem = undefined;
				}
				if ( manage.createdByThemselves ) {
					manage.createdByThemselves = undefined;
				}

				manage.all
					? manage.all.type = actionType
					: manage.all = { type: actionType };

				if (
					actionType !== ActionFieldManageType.CUSTOM
				) {
					if ( manage.all.fields ) {
						manage.all.fields = undefined;
					}
					break;
				}

				if (
					!manage.all.fields
				) {
					manage.all.fields = _.cloneDeep( this.fields );
				}

				this.isColumnManageShow = true;

				this._checkStateView( manage.all.fields );
				this._checkStateNone( manage.all.fields );
				this._checkStateEdit( manage.all.fields );

				break;
			case FieldManageType.CREATED_BY_THEMSELVES:
				if (
					manage.assignedToThem
				) {
					manage.assignedToThem = undefined;
				}
				if (
					manage.all
				) {
					manage.all = undefined;
				}

				manage.createdByThemselves
					? manage.createdByThemselves.type = actionType
					: manage.createdByThemselves = { type: actionType };

				if ( actionType !== ActionFieldManageType.CUSTOM ) {
					if (
						manage.createdByThemselves.fields
					) {
						manage.createdByThemselves.fields = undefined;
					}
					break;
				}

				if (
					!manage.createdByThemselves.fields
				) {
					manage.createdByThemselves.fields
						= _.cloneDeep( this.fields );
				}

				this.isColumnManageShow = true;

				this._checkStateView( manage.createdByThemselves.fields );
				this._checkStateNone( manage.createdByThemselves.fields );
				this._checkStateEdit( manage.createdByThemselves.fields );
				break;
			case FieldManageType.ASSIGNED_TO_THEM:
				if ( manage.all ) {
					manage.all = undefined;
				}
				if (
					manage.createdByThemselves
				) {
					manage.createdByThemselves = undefined;
				}

				manage.assignedToThem[ index ].type = actionType;
				if (
					!manage.assignedToThem[ index ].fields
				) {
					manage.assignedToThem[ index ].fields = this.fields;
				}

				manage.assignedToThem[ index ].type
					= actionType;

				!manage.assignedToThem[ index ].fields
				&& ( manage.assignedToThem[ index ].fields
					= this.fields );

				this.peopleFieldIdOfField
					= manage.assignedToThem[ index ].id;

				this._checkStateView( manage.assignedToThem[ index ].fields );
				this._checkStateNone( manage.assignedToThem[ index ].fields );
				this._checkStateEdit( manage.assignedToThem[ index ].fields );
				break;
		}

		this.accessedBoard.permission.detail.field.viewAndEdit
			= manage;
	}

	/**
	 * @param {FieldManageType} type
	 * @return {void}
	 */
	public fieldManageTypeChanged( type: FieldManageType ) {
		const fieldPermission: IFieldsPermission
			= {
				type: ActionFieldManageType.CAN_VIEW_ALL,
				fields: this.fields,
			};

		switch ( type ) {
			case FieldManageType.NONE:
				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit = { type };
				break;
			case FieldManageType.CREATED_BY_THEMSELVES:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.field
					.viewAndEdit
					.createdByThemselves
				) break;

				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit = { type };
				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit
				.createdByThemselves = fieldPermission;

				break;
			case FieldManageType.ALL:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.field
					.viewAndEdit
					.all
				) break;

				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit = { type };
				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit
				.all = fieldPermission;

				break;
			case FieldManageType.ASSIGNED_TO_THEM:
				if (
					this
					.accessedBoard
					.permission
					.detail
					.field
					.viewAndEdit
					.assignedToThem
					?.length
				) break;

				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit = { type };
				this
				.accessedBoard
				.permission
				.detail
				.field
				.viewAndEdit
				.assignedToThem = [];
				break;
		}
	}

	/**
	 * @param {IFieldsPermission} permission
	 * @param {ActionType} actionType
	 * @return {void}
	 */
	public changeAllFieldsOption(
		permission: IFieldsPermission,
		actionType: ActionType
	) {
		switch( actionType ) {
			case this.actionType.CAN_VIEW:
				permission.fields
					= _.map(
						permission.fields,
						( field: IFieldAccess ) => {
							return {
								...field,
								access: this.actionType.CAN_VIEW,
							};
						}
					);
				this._checkStateView( permission.fields );

				break;
			case this.actionType.CAN_EDIT:
				permission.fields
					= _.map(
						permission.fields,
						( field: IFieldAccess ) => {
							return {
								...field,
								access: this.actionType.CAN_EDIT,
							};
						}
					);
				this._checkStateEdit( permission.fields );

				break;
			case this.actionType.NONE:
				permission.fields
					= _.map(
						permission.fields,
						( field: IFieldAccess ) => {
							return {
								...field,
								access: this.actionType.NONE,
							};
						}
					);
				this._checkStateNone( permission.fields );
		}

	}

	/**
	 * @param {IFieldsPermission} permission
	 * @param {number} fieldIndex
	 * @param {ActionType} type
	 * @return {void}
	 */
	public onRowManageFieldChange(
		permission: IFieldsPermission,
		fieldIndex: number,
		type: ActionType
	) {
		permission.fields[ fieldIndex ].access = type;

		this._checkStateView( permission.fields );
		this._checkStateNone( permission.fields );
		this._checkStateEdit( permission.fields );

		this._cdRef.markForCheck();
	}

	// /**
	//  * @param {IBoardPermission} board
	//  * @param {number} index
	//  * @param {string} type
	//  * @return {void}
	//  */
	// public changeAssignedRowPermission( board: IBoardPermission, index: number, type: string ) {
	// 	const assignedRowPermission: IAssignedRecordPermission = board.permission.detail.record.manage.assignedToThem[ index ];

	// 	switch( type ) {
	// 		case 'comment':
	// 			assignedRowPermission.comment = !assignedRowPermission.comment;
	// 			break;
	// 		case 'editChecklist':
	// 			assignedRowPermission.editChecklist = !assignedRowPermission.editChecklist;
	// 			break;
	// 		case 'editDescription':
	// 			assignedRowPermission.editDescription = !assignedRowPermission.editDescription;
	// 			break;
	// 		case 'lock':
	// 			assignedRowPermission.lock = !assignedRowPermission.lock;
	// 			break;
	// 		case 'delete':
	// 			assignedRowPermission.delete = !assignedRowPermission.delete;
	// 			break;
	// 	}

	// 	board.permission.detail.record.manage.assignedToThem[ index ] = assignedRowPermission;

	// 	this._cdRef.markForCheck();
	// }

	/**
	 * @return {void}
	 */
	public removeRowAssignedRowPermission() {
		const permission: IAssignedRecordPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.record
			.manage
			.assignedToThem;
		const peopleFieldIDsSelected: Record<IField[ 'id' ], IField>
			= _.keyBy(
				_.filter( this.peopleFields, { isSelected: true } ),
				'id'
			);

		_.remove(
			permission,
			(
				_assignedRecord: IAssignedRecordPermission
			) => peopleFieldIDsSelected[ _assignedRecord.fieldID ]
		);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {IFieldAssignedRowPermission[]} _permission
	 * @return {void}
	 */
	public removeColumnAssignedRowPermission() {
		const permission: IFieldAssignedRowPermission[]
			= this
			.accessedBoard
			.permission
			.detail
			.field
			.viewAndEdit
			.assignedToThem;
		const peopleFieldIDsSelected: Record<IField[ 'id' ], IField>
			= _.keyBy(
				_.filter( this.peopleFieldsOfField, { isSelected: true } ),
				'id'
			);

		_.remove(
			permission,
			(
				_fieldAssigned: IFieldAssignedRowPermission
			) => peopleFieldIDsSelected[ _fieldAssigned.id ]
		);

		this._cdRef.markForCheck();
	}

	/**
	 * @param {IBoardPermission} board
	 * @param {BoardPermissionType} type
	 * @param {boolean=} isEdit
	 * @return {void}
	 */
	public onBoardPermissionAccess(
		board: IBoardPermission,
		type: BoardPermissionType,
		isEdit?: boolean
	) {
		this.isBoardPermissionTypeChange.emit( true );

		board.permission.type = type;

		switch( type ){
			case this.boardPermissionType.CUSTOM:
			case this.boardPermissionType.VIEW_ONLY:
				this.accessedBoard = board;
				this.accessedBoardChange.emit( this.accessedBoard );

				this._setDefaultPermissionDetails( type, isEdit );
				this._initData();
				this._inItViews();
				break;
			case this.boardPermissionType.NO_PERMISSION:
			case this.boardPermissionType.FULL_PERMISSION:
				if ( this.accessedBoard?.permission?.detail ) {
					this.accessedBoard.permission.detail = undefined;
				}
				break;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {number} type
	 * @return {void}
	 */
	public onAccessViewTypeChange( type: number ) {
		this.accessedBoard.permission.detail.view.access.type = type;
		this.isChangedDetail = true;

		if ( type === this.viewAccessType.CUSTOM ) {
			this.accessedBoard.permission.detail.view.access.viewIDs ||= [];
			this._setAccessViewDetails();
		}
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this._boardFieldService
		.get( this.accessedBoard.boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this.fieldsLookup
					= _.keyBy( fields, 'id' );

				this._fields
					= _.map(
						fields,
						( field: BoardField ) => {
							if (
								this.allFieldCanEdit
								&& FIELD_READONLY.has(
									field.dataType
								)
							) {
								this.allFieldCanEdit = false;
							}

							return {
								id: field.id,
								access: this.actionType.NONE,
							};
						}
					);

				this.fields
					= _.cloneDeep( this._fields );

				this._peopleFields
					= _.map(
						_.filter(
							fields,
							(
								_field: BoardField
							) => _field.dataType === DataType.People
						),
						( field: BoardField ) =>
							({
								id: field.id,
								name: field.name,
								dataType: field.dataType,
								isSelected: false,
							})
					);
				this.peopleFields
					= _.cloneDeep( this._peopleFields );
				this.peopleFieldsOfField
					= _.cloneDeep( this._peopleFields );
				this.peopleFieldsLookup
					= _.keyBy( this._peopleFields, 'id' );

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _inItBoardPermission() {
		this._boardService
		.get( this.baseID )
		.pipe(
			switchMap( ( boards: IBoard[] ) => {
				let _permissions: IBoardPermission[];

				if ( boards.length ) {
					this.boards = boards;

					_permissions = _.map( this.boards, ( board: IBoard ) => {
						return {
							boardID: board.id,
							boardName: board.name,
							permission: this.role
								? undefined
								: _.cloneDeep( this.permissionDefault ),
						};
					} );
				}

				_.isStrictEmpty( this.role )
					? this.role = {
						id: undefined,
						name: undefined,
						permissions: _permissions || [],
					}
					: this.role.permissions = _permissions || [];

				if ( this.role && this.role.id ) {
					return this._roleService.getBaseRoleDetail( this.role.id );
				} else {
					return of( null );
				}
			} ),
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( roleDetails: IRole ) => {
				if ( !roleDetails ) return;

				const permissionOb: Record<IBoard[ 'id' ], IBoardPermission>
					= _.keyBy(
						roleDetails.permissions,
						'boardID'
					);

				_.map(
					this.role.permissions,
					( permission: IBoardPermission ) => {
						if ( !permissionOb[ permission.boardID ] ) {
							_.assign( permission, this.permissionDefault );

							return;
						};

						_.assign(
							permission,
							permissionOb[ permission.boardID ]
						);
					}
				);

				if ( this.boards.length ) {
					this._bkBoards = _.cloneDeep( this.role.permissions );
				}

				this.baseRoleDetails = _.cloneDeep( roleDetails );

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {number} type
	 * @param {boolean=} isEdit
	 * @return {void}
	 */
	private _setDefaultPermissionDetails(
		type: number,
		isEdit?: boolean
	) {
		let defaultCustomPermissionDetails: IBoardPermissionDetail;
		let defaultViewOnlyPermissionDetails: IBoardPermissionDetail;

		this.accessedBoard.permission.detail ||= {} as IBoardPermissionDetail;

		if ( this.role && isEdit ) return;

		switch( type ) {
			case this.boardPermissionType.CUSTOM:
				if ( this.role.uniqName === this.ROLE_UNIQ_NAME.MEMBER ) {
					defaultCustomPermissionDetails = {
						board: {
							automation: ActionType.NONE,
							formatStyle: ActionType.NONE,
							parameter: ActionType.NONE,
							api: ActionType.NONE,
						},
						record: {
							create: true,
							manage: {
								type: RecordManageType.ALL,
								all: {
									delete: true,
									comment: true,
									editChecklist: true,
									editDescription: true,
									lock: true,
								},
							},
						},
						field: {
							createAndManage: true,
							viewAndEdit: {
								type: FieldManageType.ALL,
								all: {
									type: ActionFieldManageType.CAN_EDIT_ALL,
								},
							},
						},
						view: {
							create: true,
							manage: ViewManageType.ACCESS_VIEW,
							access: {
								type: ViewAccessType.ALL,
							},
						},
					};
				} else {
					defaultCustomPermissionDetails = {
						board: {
							automation: ActionType.NONE,
							formatStyle: ActionType.NONE,
							parameter: ActionType.NONE,
							api: ActionType.NONE,
						},
						record: {
							create: false,
							manage: { type: RecordManageType.NONE },
						},
						field: {
							createAndManage: false,
							viewAndEdit: { type: FieldManageType.NONE },
						},
						view: {
							create: false,
							manage: ViewManageType.CREATED_BY_THEMSELVES,
							access: {
								type: ViewAccessType.CREATED_BY_THEMSELVES,
							},
						},
					};
				}

				this.accessedBoard.permission.detail
					= defaultCustomPermissionDetails;
				break;
			case this.boardPermissionType.VIEW_ONLY:
				if ( this.role.uniqName === this.ROLE_UNIQ_NAME.VIEWER ) {
					defaultViewOnlyPermissionDetails = {
						board: {
							automation: ActionType.NONE,
							formatStyle: ActionType.NONE,
							parameter: ActionType.NONE,
							api: ActionType.NONE,
						},
						record: {
							manage: {
								type: RecordManageType.ALL,
								all: {
									comment: true,
									delete: false,
									editChecklist: false,
									editDescription: false,
									lock: false,
								},
							},
						},
						field: {
							viewAndEdit: {
								type: FieldManageType.ALL,
								all: {
									type: ActionFieldManageType.CAN_VIEW_ALL,
								},
							},
						},
						view: {
							access: {
								type: ViewAccessType.ALL,
							},
						},
					};
				} else {
					defaultViewOnlyPermissionDetails = {
						board: { automation: ActionType.NONE },
						record: { manage: { type: RecordManageType.NONE } },
						field: { viewAndEdit: { type: FieldManageType.NONE } },
						view: {
							access: {
								type: ViewAccessType.CREATED_BY_THEMSELVES,
							},
						},
					};
				}

				this.accessedBoard.permission.detail
					= defaultViewOnlyPermissionDetails;

				break;
		}
	}

	/**
	 * @return {void}
	 */
	private _inItViews() {
		this._viewService
		.get( this.accessedBoard.boardID )
		.subscribe({
			next: ( views: View[] ) => {
				this._views
					= views;

				if (
					this.accessedBoard.permission.detail.view.access.type
						!== this.viewAccessType.CUSTOM
				) return;

				this.accessedBoard.permission.detail.view.access.viewIDs
					||= [];

				this._setAccessViewDetails();
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {View[]} views
	 * @return {void}
	 */
	private _setAccessViewDetails(
		views: View[] = this._views
	) {
		const indexBoardPermission: number
			= _.findIndex(
				this.baseRoleDetails?.permissions,
				{ boardID: this.accessedBoard.boardID }
			);

		this.views = _.map( views, ( view: View ): IViewExtra => {
			const _isAccess: boolean
				= _.includes(
					this
					.baseRoleDetails
					?.permissions[ indexBoardPermission ]
					.permission
					.detail
					?.view
					.access
					.viewIDs,
					view.id
				);
			const createdByName: string
				= _.find(
					this.users,
					{ id: view.createdBy }
				)?.name;

			return {
				id: view.id,
				name: view.name,
				createdBy: createdByName,
				isAccess: _isAccess ? true : false,
				type: view.type,
			};
		} );
	}

	/**
	 * @param {IFieldAccess[]} fields
	 * @return {boolean}
	 */
	private _checkStateView( fields: IFieldAccess[] ) {
		this.isAllFieldCanView
			= fields.length
				=== _.filter(
					fields,
					{ access: this.actionType.CAN_VIEW }
				)?.length;

		if ( this.isAllFieldCanView ) {
			this.isAllFieldCanEdit
				= this.isAllFieldNone
				= false;
		}
	}

	/**
	 * @param {IFieldAccess[]} fields
	 * @return {void}
	 */
	private _checkStateEdit( fields: IFieldAccess[] ) {
		this.isAllFieldCanEdit
			= fields.length
				=== _.filter(
					fields,
					{ access: this.actionType.CAN_EDIT }
				)?.length;

		if ( this.isAllFieldCanEdit ) {
			this.isAllFieldCanView
				= this.isAllFieldNone
				= false;
		}
	}

	/**
	 * @param {IFieldAccess[]} fields
	 * @return {void}
	 */
	private _checkStateNone( fields: IFieldAccess[] ) {
		this.isAllFieldNone
			= fields.length
				=== _.filter(
					fields,
					{ access: this.actionType.NONE }
				)?.length;

		if ( this.isAllFieldNone ) {
			this.isAllFieldCanView
				= this.isAllFieldCanEdit
				= false;
		}
	}
}
