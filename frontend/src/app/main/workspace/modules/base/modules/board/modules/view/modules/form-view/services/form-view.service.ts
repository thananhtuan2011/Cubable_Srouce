import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Subject
} from 'rxjs';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	BoardForm,
	FormSubmit
} from '@main/workspace/modules/base/modules/board/modules/form/interfaces';
import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	DataFormUpdate,
	FormViewPublic
} from '../interfaces';

@Injectable()
export class FormViewService {

	public readonly editing$: Subject<void>
		= new Subject<void>();

	private readonly _endPoint: string
		= '/api/view-form';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {View} data
	 * @return {Observable}
	 */
	public update( id: ULID, data: DataFormUpdate ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {boolean} isPublic
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public setPublic(
		id: ULID,
		isPublic: boolean
	): Observable<{publicLink: string}> {
		return this._apiService
		.call(
			`${this._endPoint}/set-public/${id}`,
			'POST',
			{ isPublic }
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getPublicLink( id: ULID ): Observable<FormViewPublic> {
		return this._apiService
		.call(
			`${this._endPoint}/public-link/${id}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<BoardForm> {
		return this._apiService
		.call(
			`${this._endPoint}/detail/${id}`,
			'GET'
		);
	}

	/**
	 * @param {FormSubmit} data
	 * @return {Observable}
	 */
	public submit( data: FormSubmit ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/submit`,
			'POST',
			data
		);
	}

}
