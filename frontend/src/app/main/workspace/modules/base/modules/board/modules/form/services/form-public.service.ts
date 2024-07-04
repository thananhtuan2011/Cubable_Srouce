import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable
} from 'rxjs';
import {
	ULID
} from 'ulidx';

import {
	WorkspaceApiService
} from '@main/workspace/services';
import {
	ReferenceItemsByView
} from '@main/common/field/interfaces';

import {
	BoardForm,
	FormSubmit
} from '../interfaces';

@Injectable()
export class BoardFormService {

	private readonly _endPoint: string
		= '/shared/public_access';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {ULID} workspaceID
	 * @param {ULID} formID
	 * @return {Observable}
	 */
	public access(
		workspaceID: ULID,
		formID: ULID
	): Observable<BoardForm> {
		return this._apiService
		.call(
			`${this._endPoint}/form`,
			'GET',
			{
				workspaceID,
				formID,
			}
		);
	}

	/**
	 * @param {ULID} workspaceID
	 * @param {FormSubmit} data
	 * @return {Observable}
	 */
	public submit(
		workspaceID: ULID,
		data: FormSubmit
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/form-submit`,
			'POST',
			{
				...data,
				workspaceID,
			}
		);
	}

	/**
	 * @param {ULID[]} viewID
	 * @return {Observable}
	 */
	public getListReferenceByView(
		fieldID: ULID,
		formID: ULID,
		workspaceID: ULID
	): Observable<ReferenceItemsByView> {
		return this._apiService.call(
			`${this._endPoint}
			/list-record-by-reference
			/${fieldID}?formID=${formID}&workspaceID=${workspaceID}`,
			'GET'
		);
	}

}
