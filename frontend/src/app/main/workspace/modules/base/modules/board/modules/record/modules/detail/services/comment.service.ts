import {
	Injectable,
	inject
} from '@angular/core';
import _ from 'lodash';
import {
	Observable
} from 'rxjs';

import {
	CUBComment,
	CUBCommentContent
} from '@cub/material/comment/interfaces';

import {
	WorkspaceApiService
} from '@main/workspace/services';
import { ULID } from 'ulidx';

export interface CommentQuery {
	limit: number;
	offset: number;
}

export type CommentCreate
	= CUBCommentContent
	& Pick<
		CUBComment,
		'parentID'
	>;

@Injectable()
export class CommentService {

	private readonly _endPoint: string = '/api/comment';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {CommentQuery} params
	 * @param {ULID} recordID
	 * @return {Observable}
	 */
	public get(
		params: CommentQuery,
		recordID: ULID
	): Observable<CUBComment[]> {
		return this._apiService.call(
			`${this._endPoint}/list/${recordID}`,
			'GET',
			{ ...params }
		);
	}

	/**
	 * @param {CommentQuery} params
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getReplies(
		params: CommentQuery,
		id: ULID
	): Observable<CUBComment[]> {
		return this._apiService.call(
			`${this._endPoint}/get-replies/${id}`,
			'GET',
			{ ...params }
		);
	}

	/**
	 * @param {CommentCreate} data
	 * @param {ULID} recordID
	 * @param {ULID} boardID
	 * @return {Observable}
	 */
	public create(
		data: CommentCreate,
		recordID: ULID,
		boardID: ULID
	): Observable<CUBComment> {
		return this._apiService.call(
			`${this._endPoint}/create`,
			'POST',
			{ ...data, recordID, boardID }
		);
	}

	/**
	 * @param {ULID} id
	 * @param {CUBCommentContent} data
	 * @param {ULID} boardID
	 * @return {Observable}
	 */
	public update(
		id: ULID,
		data: CUBCommentContent,
		boardID: ULID
	): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/update/${id}`,
			'PATCH',
			{ ...data, boardID }
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
