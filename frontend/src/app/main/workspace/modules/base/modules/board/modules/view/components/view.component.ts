import {
	AfterViewChecked,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
	inject
} from '@angular/core';
import {
	ActivatedRoute,
	Router
} from '@angular/router';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	finalize
} from 'rxjs';
import {
	startWith
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	Unsubscriber,
	generateUniqueName,
	untilCmpDestroyed
} from '@core';

import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBMenuComponent
} from '@cub/material/menu';

import {
	IBoardExtra
} from '@main/workspace/modules/base/modules/board/components';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	RecordService
} from '../../record/services';
import {
	View,
	ViewActiveEmit,
	ViewCreate
} from '../interfaces';
import {
	SharingType,
	ViewType
} from '../resources';
import {
	ViewService
} from '../services';
import {
	SharedChange,
	UpdateChange
} from '../modules/common/components';
import {
	AllViewComponent
} from '../modules/all-view/components';
import {
	DataViewComponent
} from '../modules/data-view/components';

@Unsubscriber()
@Component({
	selector		: 'view',
	templateUrl		: '../templates/view.pug',
	styleUrls		: [ '../styles/view.scss' ],
	host			: { class: 'view' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent
implements AfterViewInit, AfterViewChecked, OnChanges {

	@ViewChild( 'allViewComp' )
	public allViewComp: AllViewComponent;
	@ViewChild( 'newViewMenu' )
	public newViewMenu: CUBMenuComponent;
	@ViewChildren( 'dataViewComps' )
	protected dataViewComps: QueryList<DataViewComponent>;

	@Input() @CoerceBoolean()
	public isDrawerOpen: boolean;
	@Input() @CoerceBoolean()
	public isCreateView: boolean;
	@Input() @CoerceArray()
	public boards: IBoardExtra[];
	@Input() public board: IBoard;

	@Output() public boardChange: EventEmitter<IBoardExtra>
		= new EventEmitter<IBoardExtra>();
	@Output() public isBorderRadiusAdd: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public activeViewChange: EventEmitter<ViewActiveEmit<View>>
		= new EventEmitter<ViewActiveEmit<View>>();
	@Output() public allViewHidden: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public notHasView: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected readonly VIEW_TYPE: typeof ViewType = ViewType;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _viewService: ViewService
		= inject( ViewService );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _router: Router
		= inject( Router );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _recordService: RecordService
		= inject( RecordService );

	protected isLoading: boolean = true;
	protected canCreate: boolean;
	protected tempView: View;
	protected activeView: View;
	protected boardID: ULID;
	protected views: View[];

	private _rootViews: View[];
	private _dataViewComps: DataViewComponent[];

	get showedViews(): View[] {
		return _.filter( this.views, ( view: View ) => !view.isHidden );
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.board?.currentValue ) this._init();
	}

	ngAfterViewInit() {
		this.dataViewComps
		.changes
		.pipe(
			startWith( this.dataViewComps ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( items: QueryList<DataViewComponent> ) => {
				this._dataViewComps = ( items as ObjectType )?._results;
			},
		});
	}

	ngAfterViewChecked() {
		this.emitBorderRadiusRemove();
		this._checkAvailableView();
	}

	/**
	 * @param {IBoard} board
	 * @return {void}
	 */
	protected changeBoard( board: IBoard ) {
		this.boardChange.emit( board );
	}

	/**
	 * @param {UpdateChange} valueChange
	 * @param {boolean=} isAllView
	 * @return {void}
	 */
	protected update(
		valueChange: UpdateChange,
		isAllView?: boolean
	) {
		this._setRootValue();

		const index: number
			= this._getViewIndex( valueChange.view );
		let viewMarkForCheck: View = this.views[ index ];

		if ( _.has( valueChange.data, 'name' ) ) {
			_.assign( this.views[ index ], valueChange.data );
			this.activeView = this.views[ index ];
			this.activeViewChange.emit({
				view: this.activeView,
			});

			this._cdRef.detectChanges();

			this._viewService
			.update( valueChange.view.id, valueChange.data )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				error: () => this._resetValue(),
			});
		}

		if ( _.has( valueChange.data, 'isHidden' ) ) {
			_.assign( this.views[ index ], valueChange.data );

			if ( valueChange.view.id !== this.activeView?.id ) {
				if ( !valueChange.data.isHidden
					&& _.filter(
						this.views,
						{ isHidden: false }
					).length === 1
				) {
					this.activeView = this.views[ index ];
				}
			};

			this.changeView(
				valueChange.view.id === this.activeView?.id
					? this._getActiveView( index )
					: this.activeView,
				true
			);

			this.syncViews();

			this._viewService
			.updateAccessibleView( valueChange.view.id, valueChange.data )
			.pipe(
				finalize( () => this.syncViews() ),
				untilCmpDestroyed( this )
			).subscribe({ error: () => this._resetValue() });
		}

		if ( _.has( valueChange.data, 'isDefault' ) ) {
			const defaultIndex: number
				= _.findIndex( this.views, { isDefault: true } );

			viewMarkForCheck = this.views[ defaultIndex ];

			if ( this.views[ defaultIndex ] ) {
				this.views[ defaultIndex ].isDefault = false;
			}

			_.assign( this.views[ index ], valueChange.data );

			this.syncViews();

			this._viewService
			.updateAccessibleView( valueChange.view.id, valueChange.data )
			.pipe(
				finalize( () => this.syncViews() ),
				untilCmpDestroyed( this )
			).subscribe({
				error: () => this._resetValue(),
			});
		}

		if ( !isAllView ) return;

		this.allViewComp.markForCheck( viewMarkForCheck );

		const viewComp: DataViewComponent
			= _.find(
				this._dataViewComps,
				( comp: DataViewComponent ) => {
					return comp.view.id === viewMarkForCheck.id;
				}
			);

		if ( !viewComp ) return;

		viewComp.markForCheck();
	}

	/**
	 * @param {ViewType} type
	 * @param {boolean=} canChangeName
	 * @return {void}
	 */
	protected create(
		type: ViewType,
		canChangeName: boolean = true
	) {
		this._setRootValue();

		const name: string
			= this._generateUniqueName( type );

		this.views ||= [];

		this.views.push(
			{
				name,
				type,
				isDefault	: false,
				isHidden	: false,
				canManage	: true,
				order		: null,
			} as View
		);
		this.syncViews();

		const data: ViewCreate = {
			name,
			type,
			boardID : this.boardID,
		};

		this._viewService
		.create( data )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		).subscribe({
			next: ( _view: View ) => {
				const view: View = _.last( this.views );

				_.assign( view, _view );
				this.syncViews();
				this.changeView( view, false, true );

				if ( canChangeName ) {
					setTimeout( () => this._viewService.created$.next( view ) );
				}
			},
			error: () => {
				this._resetValue();
				this.syncViews();
			},
		});
	}

	/**
	 * @param {View} view
	 * @return {void}
	 */
	protected duplicate( view: View ) {
		this._setRootValue();

		const name: string
			= this._generateUniqueName( view.type );

		this.views.push(
			{
				name,
				type		: view.type,
				isDefault	: false,
				isHidden	: false,
				canManage	: true,
				order		: null,
			} as View
		);
		this.syncViews();

		this._viewService
		.duplicate(
			view.id,
			{ name: this._generateUniqueName( view.type ) },
			this.boardID
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _view: View ) => {
				_.assign( _.last( this.views ), _view );
				this.syncViews();
				this.changeView( _.last( this.views ), false, true );
			},
			error: () => {
				this._resetValue();
				this.syncViews();
			},
		});
	}

	/**
	 * @param {SharedChange} data
	 * @return {void}
	 */
	protected share( data: SharedChange ) {
		const sharingStatusBk: SharingType = data.view.sharingStatus;

		data.view.sharingStatus = data.sharingStatus;

		this._viewService
		.share( data.view.id, data.sharingStatus )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				data.view.sharingStatus = sharingStatusBk;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {View} view
	 * @return {void}
	 */
	protected delete( view: View ) {
		this._setRootValue();

		this._confirmService
		.open(
			'BASE.BOARD.VIEW.MESSAGE.REMOVE_VIEW_CONFIRM',
			`BASE.BOARD.VIEW.LABEL.${
				view.type === ViewType.DATA
					? 'REMOVE_DATA_VIEW'
					: 'REMOVE_FORM_VIEW'
			}`,
			{
				warning: true,
				translate: { view: view.name },
				buttonApply: {
					text: 'BASE.BOARD.VIEW.LABEL.DELETE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this._setRootValue();

				const index: number = this._getViewIndex( view );
				const deletedView: View = this.views[ index ];

				_.remove(
					this.views,
					( _view: View, _index: number ) => index === _index
				);

				this.changeView(
					this._getActiveView( index, true ),
					true
				);
				this.syncViews();

				this._viewService
				.delete( deletedView.id, this.boardID )
				.pipe( untilCmpDestroyed( this ) ).subscribe({
					error: () => {
						this._resetValue();
						this.syncViews();
					},
				});
			},
		});
	}

	/**
	 * @param {View} view
	 * @param {boolean=} notSync
	 * @param {boolean=} editingForm
	 * @return {void}
	 */
	protected changeView(
		view: View,
		notSync?: boolean,
		editingForm?: boolean
	) {
		// enhance ở https://cubable.atlassian.net/browse/PMS-262
		// this._toastService.closeAll();

		if (
			view.isHidden
			|| this.activeView?.id === view.id
		) {
			return;
		}

		this._router.navigate(
			[],
			{
				queryParams: { viewID: view?.id || null },
				queryParamsHandling: 'merge',
			}
		);

		this.activeView = _.cloneDeep( view );

		this.activeViewChange.emit({
			editingForm,
			view: this.activeView,
		});

		// enhance ở https://cubable.atlassian.net/browse/PMS-262
		// if ( view.isHidden ) {
		// 	this.tempView = _.cloneDeep( view );
		// 	this._toastService.info( 'VIEW.COMMON.MESSAGE.HIDING_VIEW' , { duration: 10000 } );
		// } else {
		// 	this.tempView = null;
		// }

		!notSync && this.syncViews();

		this._cdRef.markForCheck();
	}

	/**
	 * @param {View} view
	 * @return {void}
	 */
	protected export(
		view: View
	) {
		this._recordService.exportFile$.next( view.name );
	}

	/**
	 * @return {void}
	 */
	protected syncViews() {
		this.rerenderViews();
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected emitBorderRadiusRemove() {
		if ( !this.views ) return;

		const availableViews: View[]
			= ( _.filter( this.views, { isHidden: false } ) ) as View[];

		availableViews?.length > 0
		&& this.activeView?.id === availableViews[ 0 ].id
			? this.isBorderRadiusAdd.emit( false )
			: this.isBorderRadiusAdd.emit( true );

		if ( !this.tempView ) return;

		const tempViewIndex: number
			= _.findIndex(
				this.views,
				{ id: this.tempView?.id }
			);

		if ( tempViewIndex < 0 ) return;

		if ( availableViews.length === 0
			|| tempViewIndex < _.findIndex(
				this.views,
				{ id: availableViews[ 0 ].id }
			) ) {
			this.isBorderRadiusAdd.emit( false );
		}
	}

	/**
	 * @return {void}
	 */
	protected rerenderViews() {
		this.emitBorderRadiusRemove();
		this._checkAvailableView();
	}

	/**
	 * @param {View} view
	 * @return {number}
	 */
	private _getViewIndex( view: View ) {
		let index: number;
		_.forEach( this.views, ( _view: View, _index: number ) => {
			( _view.id === view.id ) && ( index = _index );
		});

		return index;
	}

	/**
	 * @return {void}
	 */
	private _init() {
		this.boardID = this.board.id;
		this.canCreate = this.board.permission.detail.view.create;

		this._viewService
		.get( this.boardID, true )
		.pipe(
			finalize( () => {
				this.isLoading = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		).subscribe({
			next: ( views: View[] ) => {
				this.views = views;

				const viewID: ULID
					= this._activatedRoute.snapshot.queryParams.viewID;
				const defaultViewIndex: number
					= _.findIndex( this.views, { isDefault: true } );
				const availableViews: View[]
					= _.filter( this.views, { isHidden: false } );

				this._checkAvailableView();

				if ( availableViews.length === 0 ) return;

				const availableViewIndex: number
					= _.findIndex(
						this.views,
						( _view: View ) => _view.id === availableViews[ 0 ].id
					);

				this.activeView = _.find( availableViews, { id: viewID } );

				if ( !this.activeView ) {
					if ( defaultViewIndex > -1 ) {
						this.views[ defaultViewIndex ].isHidden
							? _.find( this.views, { isHidden: false } )
							: this.activeView = this.views[ defaultViewIndex ];
					} else if ( availableViews.length > 0
						&& availableViewIndex > -1 ) {
						this.activeView = this.views[ availableViewIndex ];
					}
				}

				this._router.navigate(
					[],
					{
						queryParams: { viewID: this.activeView.id },
						queryParamsHandling: 'merge',
					}
				);

				this.activeViewChange.emit({
					view: this.activeView,
				});
			},
		});
	}

	// /**
	//  * @param {number} index
	//  * @return {void}
	//  */
	// private _activeView( index: number ) {
	// 	for ( let i: number = index; this.views[ i ] !== this.activeView; i++) {

	// 		if ( this.views[ i ].isHidden ) continue;

	// 		this.activeView = this.views[ i ];
	// 		return;
	// 	}
	// }

	/**
	 * @return {void}
	 */
	private _checkAvailableView() {
		this.notHasView.emit( !this.views?.length );

		if ( !this.views?.length ) return;

		this.allViewHidden.emit(
			!( _.filter(
				this.views,
				{ isHidden: false } ).length || this.tempView
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _setRootValue() {
		this._rootViews = _.cloneDeep( this.views );
	}

	/**
	 * @return {string}
	 */
	private _generateUniqueName( type: ViewType ): string {
		return generateUniqueName(
			_.map( this.views, 'name' ),
			type === this.VIEW_TYPE.DATA
				? this._translateService.instant( 'VIEW.COMMON.LABEL.DATA' )
				: this._translateService.instant( 'VIEW.COMMON.LABEL.FORM' ),
			80,
			( idx: number ): string => idx ? ` ${idx}` : ` 1`
		);
	}

	/**
	 * @return {void}
	 */
	private _resetValue() {
		this.views = _.cloneDeep( this._rootViews );
	}

	/**
	 * @param {number} index
	 * @param {boolean=} isDelete
	 * @return {View}
	 */
	private _getActiveView(
		index: number,
		isDelete?: boolean
	): View {
		let newView: View;
		const hasAvailableView: boolean
			= !!~_.findIndex(
				_.slice( this.views, index ), { isHidden: false }
			);

		for (
			let i: number = hasAvailableView
				? ( isDelete ? index : index + 1 )
				: ( index - 1 );

			this.views[ i ] && ( this.activeView?.id !== this.views[ i ].id );
			( hasAvailableView ? i++ : i-- ) ) {

			if ( this.views[ i ].isHidden ) continue;

			newView = this.views[ i ];

			break;
		}

		return newView || null;
	}
};
