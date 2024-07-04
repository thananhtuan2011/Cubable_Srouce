import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Observer,
	Subject,
	map
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { ULID } from 'ulidx';
import _ from 'lodash';

import { WorkspaceApiService } from '@main/workspace/services';

import { IBoard } from '../../../interfaces';

import {
	View,
	ViewArrange,
	ViewCreate,
	ViewDuplicate,
	ViewResponse,
	ViewUpdate
} from '../interfaces';
import { SharingType } from '../resources';

@Injectable()
export class ViewService {

	public created$: Subject<View>
		= new Subject<View>();

	private readonly _endPoint: string
		= '/api/view';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	private _views: Record<IBoard[ 'id' ], View[]>;

	get views(): Record<IBoard[ 'id' ], View[]> {
		return this._views || {};
	}
	set views( data: Record<IBoard[ 'id' ], View[]> ) {
		this._views = { ...this._views, ...data };
	}

	/**
	 * @param {ULID} boardID
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public get( boardID: ULID, forceReload?: boolean ): Observable<View[]> {
		if ( this.views[ boardID ]?.length && !forceReload ) {
			return new Observable( ( observer: Observer<View[]> ) => {
				observer.next( this.views[ boardID ] );
				observer.complete();
			} );
		}

		return this._apiService
		.call( `${this._endPoint}/list`, 'GET', { boardID } )
		.pipe( map( ( _views: View[] ) => {
			this.views = {
				[ boardID ]: _.isArray( _views )
					? _views
					: [],
			};

			return this.views[ boardID ];
		} ) );
	}

	/**
	 * @param {ViewCreate} data
	 * @return {Observable}
	 */
	public create( data: ViewCreate ): Observable<ViewResponse> {
		return this._apiService
		.call( `${this._endPoint}/create`, 'POST', data )
		.pipe( tap( ( view: ViewResponse ) => {
			this.views = {
				[ data.boardID ]: [
					...this.views[ data.boardID ],
					{ ...data, ...view } as View,
				],
			};
		} ) );
	}

	/**
	 * @param {ULID} id
	 * @param {ViewDuplicate} data
	 * @param {ULID} boardID
	 * @return {Observable}
	 */
	public duplicate(
		id: ULID,
		data: ViewDuplicate,
		boardID: ULID
	): Observable<ViewResponse> {
		return this._apiService
		.call( `${this._endPoint}/duplicate/${id}`, 'POST', data )
		.pipe( tap( ( view: ViewResponse ) => {
			this.views = {
				[ boardID ]: [
					...this.views[ boardID ],
					{ ...data, ...view } as View,
				],
			};
		} ) );
	}

	/**
	 * @param {ULID} id
	 * @param {ViewUpdate} data
	 * @return {Observable}
	 */
	public updateAccessibleView(
		id: ULID,
		data: ViewUpdate
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update-accessible-view/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {View} data
	 * @return {Observable}
	 */
	public update( id: ULID, data: ViewUpdate ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ViewArrange} data
	 * @return {Observable}
	 */
	public arrangeAccessibleViews( data: ViewArrange ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/arrange-accessible-views`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @param {SharingType} sharingStatus
	 * @return {Observable}
	 */
	public share( id: ULID, sharingStatus: SharingType ) {
		return this._apiService
		.call(
			`${this._endPoint}/share/${id}`,
			'PUT',
			{ sharingStatus }
		);
	}

	/**
	 * @param {ULID} id
	 * @param {ULID} boardID
	 * @return {Observable}
	 */
	public delete( id: ULID, boardID: ULID ): Observable<void> {
		return this._apiService
		.call( `${this._endPoint}/delete/${id}`, 'DELETE' )
		.pipe( tap( () => {
			const views: View[]
				= _.filter(
					this.views[ boardID ],
					( view: View ) => view.id !== id
				);

			this.views = { [ boardID ]: views };
		} ) );
	}

}
