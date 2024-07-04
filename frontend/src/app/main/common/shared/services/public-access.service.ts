import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HASH } from '@environments/hash';
import { ApiService, ApiHeaders } from '@core';

// import { IBoardFormFieldSubmit } from '@main/workspace/modules/collection/modules/board/modules/form/services';

import { IDocumentExportFormat } from '../interfaces';

@Injectable()
export class PublicAccessService {

	private _endPoint: string = '/shared/public_access';
	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _headers: ApiHeaders = { Authorization: `Bearer ${HASH.SHARED_TOKEN}` };

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor( private _apiService: ApiService ) {}

	/**
	 * @param {string} workspaceID
	 * @param {string} accessCode
	 * @return {Observable}
	 */
	public accessDocument( workspaceID: string, accessCode: string ): Observable<any> {
		return this._apiService.call( `${this._endPoint}/document`, 'GET', { workspaceID, accessCode }, this._headers );
	}

	/**
	 * @param {string} workspaceID
	 * @param {string} accessCode
	 * @param {string} docID
	 * @param {string} pageIDs
	 * @param {IDocumentExportFormat} format
	 * @return {Observable}
	 */
	public exportDocument(
		workspaceID: string,
		accessCode?: string,
		docID?: string,
		pageIDs?: string[],
		format?: IDocumentExportFormat
	): Observable<any> {
		return this._apiService.call(
			`${this._endPoint}/document/export?workspaceID=${workspaceID}`,
			'POST',
			{ accessCode, docID, pageIDs, format },
			this._headers
		);
	}

	/**
	 * @param {string} workspaceID
	 * @param {string} accessCode
	 * @return {Observable}
	 */
	public accessBoardForm( workspaceID: string, accessCode: string ): Observable<any> {
		return this._apiService.call( `${this._endPoint}/board-form`, 'GET', { workspaceID, accessCode }, this._headers );
	}

	/**
	 * @param {string} workspaceID
	 * @param {string} formID
	 * @param {string} fieldID
	 * @return {Observable}
	 */
	public getBoardFormReference( workspaceID: string, formID: string, fieldID: string ): Observable<any> {
		const params: ObjectType = { workspaceID, formID, fieldID };
		return this._apiService.call( `${this._endPoint}/board-form-reference/item`, 'GET', params, this._headers );
	}

	/**
	 * @param {string} workspaceID
	 * @param {string} accessCode
	 * @param {IBoardFormFieldSubmit[]} fields
	 * @return {Observable}
	 */
	public submitBoardForm( workspaceID: string, accessCode: string, fields: any[] ): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/board-form/submit?workspaceID=${workspaceID}`,
			'POST',
			{ accessCode, fields },
			this._headers
		);
	}

}
