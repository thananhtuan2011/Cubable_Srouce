import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Observer
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
	WorkspaceApiService
} from '@main/workspace/services';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ITeam
} from '../../settings/modules/workspace/modules/user-system/modules/team/interfaces';

import {
	BoardFieldService
} from '../modules/board/services';
import {
	BaseCreate,
	BaseUpdate,
	IBase
} from '../interfaces';

@Injectable()
export class BaseService {

	private readonly _endPoint: string
		= '/api/base';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );

	private _bases: IBase[];

	get bases(): IBase[] {
		return this._bases;
	}
	set bases( bases: IBase[] ) {
		this._bases = bases;
	}

	/**
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public get(
		forceReload?: boolean
	): Observable<IBase[]> {
		if ( this.bases?.length && !forceReload ) {
			return new Observable( ( observer: Observer<IBase[]> ) => {
				observer.next( _.cloneDeep( this.bases ) );
				observer.complete();
			} );
		}

		return this._apiService
		.call( `${this._endPoint}/list`, 'GET' )
		.pipe( map( ( _bases: IBase[] ) => {
			this.bases = _.isArray( _bases ) ? _bases : [];

			return _.cloneDeep( this.bases );
		} ) );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<IBase> {
		return this._apiService.call( `${this._endPoint}/detail/${id}` );
	}

	/**
	 * @param {BaseCreate=} data
	 * @return {Observable}
	 */
	public create( data?: BaseCreate ): Observable<IBase> {
		return this._apiService
		.call(
			`${this._endPoint}/create`,
			'POST',
			data
		)
		.pipe(
			tap(
				( base: IBase ) => {
					this.bases
						= [
							...this.bases,
							{ ...data, ...base },
						];
				}
			)
		);
	}

	/**
	 * @param {ULID} id
	 * @param {BaseUpdate} data
	 * @return {Observable}
	 */
	public update(
		id: ULID,
		data: BaseUpdate
	): Observable<Partial<IBase>> {
		return this
		._apiService
		.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID[]} ids
	 * @param {BaseUpdate} data
	 * @return {Observable}
	 */
	public bulkUpdatePersonal(
		ids: ULID[],
		data: BaseUpdate
	): Observable<Partial<IBase[]>> {
		return this
		._apiService
		.call(
			`${this._endPoint}/bulk-update-personal`,
			'PUT',
			{ ids, ...data }
		);
	}

	/**
	 * @param {ULID[]} ids
	 * @return {Observable}
	 */
	public delete( ids: ULID[] ): Observable<void> {
		return this._apiService
		.call( `${this._endPoint}/bulk-delete`, 'PUT', { ids } )
		.pipe(
			tap( () => {
				const bases: IBase[]
					= _.filter(
						this.bases,
						( base: IBase ) => !_.includes( ids, base.id )
					);

				this.bases = bases;

				_.forEach(
					ids,
					( id: ULID ) => {
						this
						._boardFieldService
						.actionAffectFieldInvalid$
						.next({
							baseId: id,
						});
					}
				);
			} )
		);
	}

	/**
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public removeMembers(
		baseID: ULID,
		userIDs: ULID[],
		teamIDs: ULID[]
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/remove-users-teams/${baseID}`,
			'PUT',
			{ userIDs, teamIDs }
		);
	}

	/**
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public getAvailableUser(
		baseID: ULID
	): Observable<IUser[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/available-users/${baseID}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public getAvailableTeam(
		baseID: ULID
	): Observable<ITeam[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/available-teams/${baseID}`,
			'GET'
		);
	}
}
