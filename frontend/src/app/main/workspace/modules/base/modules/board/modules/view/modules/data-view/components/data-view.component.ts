import {
	Component,
	ChangeDetectionStrategy,
	ElementRef,
	inject
} from '@angular/core';
import {
	forkJoin,
	Observable,
	Observer
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	CUBPopupService
} from '@cub/material/popup';

import {
	IError
} from '@error/interfaces';

import {
	FilterComponent
} from '@main/workspace/modules/base/modules/board/modules/filter/components';
import {
	Filter
} from '@main/workspace/modules/base/modules/board/modules/filter/interfaces';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	Field
} from '@main/common/field/interfaces';

import {
	FieldLayoutConfig,
	ViewLayout
} from '../../../interfaces';
import {
	ViewLayoutService
} from '../../../services';

import {
	BaseView
} from '../../common/components';

import {
	DataView,
	DataViewDetail
} from '../interfaces';
import {
	DataViewService
} from '../services';

@Component({
	selector		: 'data-view',
	templateUrl		: '../templates/data-view.pug',
	styleUrls		: [ '../../common/styles/common.scss' ],
	host			: { class: 'data-view' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class DataViewComponent
	extends BaseView<DataView> {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _viewLayoutService: ViewLayoutService
		= inject( ViewLayoutService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();
	private readonly _dataViewService: DataViewService
		= inject( DataViewService );

	/**
	 * @param {ElementRef} origin
	 * @param {DataView} view
	 * @param {boolean=} isFromManageTab
	 * @return {void}
	 */
	protected openPopupFilter(
		origin: ElementRef,
		view: DataView,
		isFromManageTab?: boolean
	) {
		this._popupService.open(
			origin,
			FilterComponent,
			{
				fields: this._getFields( view.id ),
				filter: this._getFilter( view.id ),
				onSave: this._updateViewFilter.bind( this, view ),
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: isFromManageTab ? 0 : -60,
			}
		);
	}

	/**
	 * @param {DataView} view
	 * @param {Filter} filter
	 * @return {void}
	 */
	private _updateViewFilter(
		view: DataView,
		filter: Filter
	) {
		this._dataViewService
		.update( view.id, { filter } )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => this._dataViewService.filterUpdated$.next(),
		});
	}

	/**
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	private _getFilter(
		viewID: ULID
	): Observable<Filter> {
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
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	private _getFields(
		viewID: ULID
	): Observable<Field[]> {
		return new Observable( ( observer: Observer<Field[]> ) => {
			forkJoin([
				this._viewLayoutService.getPersonalLayout( viewID ),
				this._boardFieldService.get( this.boardID, true ),
			])
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( [ layout, fields ]: [ ViewLayout, BoardField[] ] ) => {
					_.forEach(
						layout?.field?.fields,
						( config: FieldLayoutConfig ) => {
							const currentPosition: number =
								_.findIndex(
									fields,
									{ id: config.id }
								);

							if ( currentPosition < 0 ) return;

							const newFieldData: BoardField = _.assign(
								fields[ currentPosition ],
								_.pick( config, 'width', 'isHidden' )
							);

							if ( config.position ) {
								fields.splice( currentPosition, 1 );
								fields.splice(
									config.position,
									0,
									newFieldData
								);
							}
						} );

					observer.next(
						_.map(
							fields,
							( f: BoardField ) =>
								this._fieldHelper.createField( f )
						)
					);
					observer.complete();
				},
				error: ( e: IError ) => observer.error( e ),
			});
		} );
	}

}
