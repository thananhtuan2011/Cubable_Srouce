import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Subject
} from 'rxjs';
import {
	ULID
} from 'ulidx';

import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	Workflow,
	WorkflowUpdateDesc
} from '../interfaces';

@Injectable()
export class WorkflowService {

	public dataChanged$: Subject<void>
		= new Subject<void>();
	public readonly boardIDChanged$: Subject<void>
		= new Subject<void>();

	private readonly _endPoint: string
		= '/api/flow';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {Workflow} data
	 * @return {Observable}
	 */
	public create( data: Workflow ): Observable<Workflow> {
		return this._apiService
		.call(
			`${this._endPoint}/create`,
			'POST',
			data
		);
	}

	/**
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public get( baseID: ULID ): Observable<Workflow[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list`,
			'GET',
			{ baseID }
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @return {Observable}
	 */
	public getInfo( workflowID: ULID ): Observable<Workflow> {
		return this._apiService
		.call(
			`${this._endPoint}/info/${workflowID}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @return {Observable}
	 */
	public getDetail( workflowID: ULID ): Observable<Workflow> {
		return this._apiService
		.call(
			`${this._endPoint}/detail/${workflowID}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @param {Workflow} data
	 * @return {Observable}
	 */

	public update( workflowID: ULID,
		data: WorkflowUpdateDesc ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/update/${workflowID}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @return {Observable}
	 */
	public activate( workflowID: ULID ): Observable<Workflow> {
		return this._apiService
		.call(
			`${this._endPoint}/activate/${workflowID}`,
			'PUT',
			{}
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @return {Observable}
	 */
	public deactivate( workflowID: ULID ): Observable<Workflow> {
		return this._apiService
		.call(
			`${this._endPoint}/deactivate/${workflowID}`,
			'PUT',
			{}
		);
	}

	/**
	 * @param {ULID} workflowID
	 * @return {Observable}
	 */
	public delete( workflowID: ULID ): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/delete/${workflowID}`,
			'DELETE'
		);
	}
}
