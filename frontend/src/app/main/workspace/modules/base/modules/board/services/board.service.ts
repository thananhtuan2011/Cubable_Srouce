import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Observer,
	Subject
} from 'rxjs';
import {
	map,
	tap
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	IBase
} from '../../../interfaces';

import {
	BoardCreate,
	BoardUpdate,
	BoardDuplicate,
	IBoard
} from '../interfaces';

import {
	BoardFieldService
} from './board-field.service';

@Injectable()
export class BoardService {

	public updateBoardName$: Subject<IBoard>
		= new Subject<IBoard>();

	private readonly _endPoint: string
		= '/api/board';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );

	private _boards: Record<IBase[ 'id' ], IBoard[]>;

	get boards(): Record<IBase[ 'id' ], IBoard[]> {
		return this._boards || {};
	}
	set boards( data: Record<IBase[ 'id' ], IBoard[]> ) {
		this._boards = {
			...this._boards,
			...data,
		};
	}

	/**
	 * @param {ULID} baseID
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public get(
		baseID: ULID,
		forceReload?: boolean
	): Observable<IBoard[]> {
		if ( this.boards[ baseID ]?.length && !forceReload ) {
			return new Observable(
				( observer: Observer<IBoard[]> ) => {
					observer.next( _.cloneDeep( this.boards[ baseID ] ) );
					observer.complete();
				}
			);
		}

		return this._apiService
		.call(
			`${this._endPoint}/list`,
			'GET',
			{ baseID }
		)
		.pipe( map( ( _boards: IBoard[] ) => {
			this.boards = {
				[ baseID ]: _.isArray( _boards )
					? _boards
					: [],
			};

			return _.cloneDeep( this.boards[ baseID ] );
		} ) );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<IBoard> {
		return this
		._apiService
		.call(
			`${this._endPoint}/detail/${id}`,
			'GET'
		);
	}

	/**
	 * @param {BoardCreate} data
	 * @return {Observable}
	 */
	public create( data: BoardCreate ): Observable<IBoard> {
		return this._apiService
		.call(
			`${this._endPoint}/create`,
			'POST',
			data
		)
		.pipe(
			tap(
				( board: IBoard ) => {
					this.boards = {
						[ data.baseID ]: [
							...this.boards[ data.baseID ],
							{ ...data, ...board },
						],
					};
				}
			)
		);
	}

	/**
	 * @param {ULID} id
	 * @param {BoardDuplicate} data
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public duplicate(
		id: ULID,
		data: BoardDuplicate,
		baseID: ULID
	): Observable<IBoard> {
		return this._apiService
		.call(
			`${this._endPoint}/duplicate/${id}`,
			'POST',
			data
		)
		.pipe(
			tap(
				( board: IBoard ) => {
					this.boards = {
						[ baseID ]: [
							...this.boards[ baseID ],
							{ ...data, ...board },
						],
					};
				}
			)
		);
	}

	/**
	 * @param {ULID} id
	 * @param {BoardUpdate} data
	 * @return {Observable}
	 */
	public update(
		id: ULID,
		data: BoardUpdate
	): Observable<IBoard> {
		return this
		._apiService
		.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public delete(
		id: ULID,
		baseID: ULID
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/delete/${id}`,
			'DELETE'
		)
		.pipe(
			tap( () => {
				const boards: IBoard[]
					= _.filter(
						this.boards[ baseID ],
						( board: IBoard ) => board.id !== id
					);

				this.boards = {
					[ baseID ]: boards,
				};

				this
				._boardFieldService
				.actionAffectFieldInvalid$
				.next({
					boardId: id,
				});
			} )
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getBoardAvailableUsers(
		id: ULID
	): Observable<IUser[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/available-users/${id}`,
			'GET'
		);
	}

}
