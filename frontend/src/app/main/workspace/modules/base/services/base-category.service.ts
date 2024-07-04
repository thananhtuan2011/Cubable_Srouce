import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	map
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	BaseCategoryCreate,
	BaseCategoryUpdate,
	IBaseCategory
} from '../interfaces';

@Injectable()
export class BaseCategoryService {

	private readonly _endPoint: string
		= '/api/category';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @return {Observable}
	 */
	public getAll(): Observable<IBaseCategory[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list`,
			'GET'
		)
		.pipe(
			map(
				( _categories: IBaseCategory[] ) => {
					return _.isArray( _categories )
						? _categories
						: [];
				}
			)
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<IBaseCategory> {
		return this._apiService.call(
			`${this._endPoint}/detail/${id}`
		);
	}

	/**
	 * @param {BaseCategoryCreate=} data
	 * @return {Observable}
	 */
	public create(
		data?: BaseCategoryCreate
	): Observable<IBaseCategory> {
		return this._apiService.call(
			`${this._endPoint}/create`,
			'POST',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @param {BaseCategoryUpdate} data
	 * @return {Observable}
	 */
	public update(
		id: ULID,
		data: BaseCategoryUpdate
	): Observable<Partial<IBaseCategory>> {
		return this._apiService.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public delete(
		id: ULID
	): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/delete/${id}`,
			'DELETE'
		);
	}
}
