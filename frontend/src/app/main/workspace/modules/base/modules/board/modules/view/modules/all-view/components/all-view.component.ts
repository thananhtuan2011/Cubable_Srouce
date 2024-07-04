import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	OnInit,
	Output,
	QueryList,
	ViewChild,
	ViewChildren,
	inject
} from '@angular/core';
import {
	CdkDragDrop,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import { finalize } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	calculateOrder,
	calculateOrders,
	untilCmpDestroyed
} from '@core';

import { CUBPopupComponent } from '@cub/material/popup';

import { UserService } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import { IUserData } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	View,
	ViewArrange
} from '../../../interfaces';
import { ViewType } from '../../../resources';

import { Base } from '../../common/components';
import { DataViewComponent } from '../../data-view/components';
import { FormViewComponent } from '../../form-view/components';

@Unsubscriber()
@Component({
	selector		: 'all-view',
	templateUrl		: '../templates/all-view.pug',
	styleUrls		: [ '../styles/all-view.scss' ],
	host			: { class: 'all-view' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AllViewComponent
	extends Base<View>
	implements OnInit, AfterViewInit {

	@ViewChild( 'allViewPopup' )
	public allViewPopup: CUBPopupComponent;
	@ViewChildren( 'dataViewComps' )
	protected dataViewComps: QueryList<DataViewComponent>;
	@ViewChildren( 'formViewComps' )
	protected formViewComps: QueryList<FormViewComponent>;

	@Output() public viewArrange: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public createChange: EventEmitter<ViewType>
		= new EventEmitter<ViewType>();

	protected tabIndex: number;

	private readonly _userService: UserService
		= inject( UserService );

	private _userID: ULID;
	private _dataViewComps: DataViewComponent[];
	private _formViewComps: FormViewComponent[];

	get manageViewCreatedByMe(): View[] {
		return _.filter(
			this.views,
			( view: View ) => view.canManage && view.createdBy === this._userID
		);
	}

	get manageViewCreatedByOther(): View[] {
		return _.filter(
			this.views,
			( view: View ) => view.canManage && view.createdBy !== this._userID
		);
	}

	ngOnInit() {
		this._userService.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( userData: IUserData ) => {
			this._userID = userData.user.id;

			this.cdRef.markForCheck();
		} );
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

		this.formViewComps
		.changes
		.pipe(
			startWith( this.formViewComps ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( items: QueryList<FormViewComponent> ) => this._formViewComps = ( items as ObjectType )?._results,
		});
	}

	/**
	 * @param {CdkDragDrop} event
	 * @return {void}
	 */
	public onViewArrange( event: CdkDragDrop<View[]> ) {
		if ( event.previousIndex === event.currentIndex ) return;

		const bkViews: View[]
			= _.cloneDeep( this.views );

		moveItemInArray(
			event.container.data,
			event.previousIndex,
			event.currentIndex
		);

		const firstIndexNull: number
			= _.findIndex( this.views, { order: null } );
		const movedIndex: number
			= firstIndexNull < event.currentIndex
				? firstIndexNull
				: event.currentIndex;

		const data: ViewArrange = {
			boardID	: this.boardID,
			views	: [],
		};

		if ( !!~firstIndexNull ) {
			const newOrders: ObjectType<number> = calculateOrders(
				_.map( this.views, 'order' ),
				movedIndex,
				this.views.length - movedIndex
			);

			_.forEach( newOrders, ( newOrder: number, index: string ) => {
				const view: View = this.views[ index ];

				if ( !view ) return;

				view.order = newOrder;

				data.views.push({
					id: view.id,
					order: newOrder,
				});
			} );
		} else {
			const preOrder: number
				= event.container.data[ event.currentIndex - 1 ]?.order;
			const nextOrder: number
				= event.container.data[ event.currentIndex + 1 ]?.order;
			const newOrder: number
				= calculateOrder( preOrder, nextOrder );

			event.item.data.order = newOrder;

			data.views.push({
				id: event.item.data.id,
				order: newOrder,
			});
		}

		this.viewService
		.arrangeAccessibleViews( data )
		.pipe(
			finalize( () => this.viewArrange.emit() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			error: () =>{
				moveItemInArray(
					event.previousContainer.data,
					event.currentIndex,
					event.previousIndex
				);

				const bkViewsLk: Record<View[ 'id' ], View>
					= _.keyBy( bkViews, 'id' );
				const viewsLk: Record<View[ 'id' ], View>
					= _.keyBy( this.views, 'id' );

				_.forEach(
					data.views,
					( view: { id: ULID } ) => viewsLk[ view.id ].order = bkViewsLk[ view.id ].order
				);

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {View=} view
	 * @return {void}
	 */
	public markForCheck( view?: View ) {
		if ( view ) {
			let viewComp: DataViewComponent | FormViewComponent;

			if ( view.type === ViewType.DATA ) {
				viewComp
					= _.find(
						this._dataViewComps,
						( comp: DataViewComponent ) => comp.view.id === view.id
					);
			} else {
				viewComp
					= _.find(
						this._formViewComps,
						( comp: FormViewComponent ) => comp.view.id === view.id
					);
			}

			if ( !viewComp ) return;

			viewComp.markForCheck();
		} else {
			_.forEach(
				this._dataViewComps,
				( comp: DataViewComponent ) => comp.markForCheck()
			);

			_.forEach(
				this._formViewComps,
				( comp: FormViewComponent ) => comp.markForCheck()
			);
		}

		this.cdRef.markForCheck();
	}

}
