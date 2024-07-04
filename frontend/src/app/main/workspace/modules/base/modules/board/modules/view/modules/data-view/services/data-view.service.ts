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

import { WorkspaceApiService } from '@main/workspace/services';

import {
	DataViewDetail,
	DataViewUpdate
} from '../interfaces';

@Injectable()
export class DataViewService {

	public filterUpdated$: Subject<void>
		= new Subject<void>();

	private readonly _endPoint: string
		= '/api/view-data';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {View} data
	 * @return {Observable}
	 */
	public update( id: ULID, data: DataViewUpdate ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	public getDetail( viewID: ULID ): Observable<DataViewDetail> {
		return this._apiService
		.call(
			`${this._endPoint}/detail/${viewID}`,
			'GET'
		);
	}

}
