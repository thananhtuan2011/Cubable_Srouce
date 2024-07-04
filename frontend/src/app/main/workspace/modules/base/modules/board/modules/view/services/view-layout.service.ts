import {
	Injectable,
	inject
} from '@angular/core';
import { Observable } from 'rxjs';
import { ULID } from 'ulidx';
import _ from 'lodash';

import { WorkspaceApiService } from '@main/workspace/services';

import { ViewLayout } from '../interfaces';

@Injectable()
export class ViewLayoutService {

	private readonly _endPoint: string
		= '/api/view';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	public readonly defaultLayout: ViewLayout = {
		field: {},
		record: {},
	};

	/**
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	public getPersonalLayout( viewID: ULID ): Observable<ViewLayout> {
		return this._apiService
		.call(
			`${this._endPoint}/detail-personal-layout/${viewID}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} viewID
	 * @param {ViewLayout} data
	 * @return {Observable}
	 */
	public updatePersonalLayout( viewID: ULID, data: ViewLayout ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update-personal-layout/${viewID}`,
			'PUT',
			data
		);
	}

}
