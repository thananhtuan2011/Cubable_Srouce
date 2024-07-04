import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';

import { ApiService } from '@core';

import { WGCIComment, WGCIIconType, WGCICommentContent } from '@wgc/wgc-comment';

import { CONSTANT as APP_CONSTANT } from '@resources';

import { IReaction } from '../interfaces';

export interface ICommentQuery {
	limit: number;
	offset: number;
	replyTo?: string;
}

export type ICommentCreate = WGCICommentContent & Pick<WGCIComment, 'content' | 'replies' | 'mentions' | 'attachments' | 'images'>;

export interface ICommentService {
	get: ( params: ObjectType, forceReload?: boolean, refID?: string ) => Observable<WGCIComment[]>;
	history: ( id: string ) => Observable<WGCIComment[]>;
	create: ( data: ObjectType, mentionAll?: boolean, refID?: string ) => Observable<WGCIComment>;
	update: ( id: string, data: ObjectType, mentionAll?: boolean ) => Observable<Partial<WGCIComment>>;
	react: ( id: string, iconType?: number ) => Observable<IReaction>;
	delete: ( id: string ) => Observable<void>;
}

export class CommentService<T = ObjectType> implements ICommentService {

	protected refKey: string;
	protected queryParams: T;

	/**
	 * @constructor
	 * @param {ApiService} apiService
	 * @param {string} endPoint
	 */
	constructor( protected apiService: ApiService, protected endPoint: string ) {}

	/**
	 * @param {T} queryParams
	 * @return {void}
	 */
	public setQueryParams( queryParams: T ) {
		if ( queryParams ) this.queryParams = queryParams;
	}

	/**
	 * @param {ICommentQuery} params
	 * @param {boolean} forceReload
	 * @param {string} refID
	 * @return {Observable}
	 */
	public get( params: ICommentQuery, forceReload?: boolean, refID?: string ): Observable<WGCIComment[]> {
		return this.apiService.call(
			`${this.endPoint}/list`,
			'GET',
			{ ...params, ...this._getRefKey( refID ), ...this.queryParams },
			forceReload ? APP_CONSTANT.API_HEADER.FORCE_RELOAD : undefined
		)
		.pipe( map( ( comments: WGCIComment[] ) => _.isArray( comments ) ? comments : [] ) );
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public history( id: string ): Observable<WGCIComment[]> {
		return this.apiService.call( `${this.endPoint}/history/${id}`, 'GET', this.queryParams );
	}

	/**
	 * @param {ICommentCreate} data
	 * @param {boolean} mentionAll
	 * @param {string} refID
	 * @return {Observable}
	 */
	public create( data: ICommentCreate, mentionAll?: boolean, refID?: string ): Observable<WGCIComment> {
		return this.apiService.call(
			`${this.endPoint}/create`,
			'POST',
			this._getParams({ ...data, ...this._getRefKey( refID ), mentionAll: !!mentionAll })
		);
	}

	/**
	 * @param {string} id
	 * @param {WGCICommentContent} data
	 * @param {boolean} mentionAll
	 * @return {Observable}
	 */
	public update( id: string, data: WGCICommentContent, mentionAll?: boolean ): Observable<Partial<WGCIComment>> {
		return this.apiService.call(
			`${this.endPoint}/update/${id}`,
			'PUT',
			this._getParams({ ...data, mentionAll: !!mentionAll })
		);
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public delete( id: string ): Observable<void> {
		return this.apiService.call( `${this.endPoint}/delete/${id}`, 'DELETE', { ...this.queryParams } );
	}

	/**
	 * @param {string} id
	 * @param {WGCIIconType} iconType
	 * @return {Observable}
	 */
	public react( id: string, iconType?: WGCIIconType ): Observable<IReaction> {
		return this.apiService.call(
			`${this.endPoint}/update/${id}`,
			'PUT',
			this._getParams( iconType ? { iconType } : { isReact: false } )
		);
	}

	/**
	 * @param {string} refID
	 * @return {ObjectType}
	 */
	private _getRefKey( refID: string ): ObjectType {
		return this.refKey ? { [ this.refKey ]: refID } : {};
	}

	/**
	 * @param {ObjectType} bodyParams
	 * @return {ObjectType}
	 */
	private _getParams( bodyParams: ObjectType ): ObjectType {
		return this.queryParams ? { queryParams: this.queryParams, bodyParams } : bodyParams;
	}

}
