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
	Notification,
	NotificationCount
} from '../interfaces';

type NotificationQuery = {
	limit: number;
	offset: number;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {

	public readonly markAllAsRead$: Subject<void>
		= new Subject<void>();

	private _endPoint: string = '/api/notification';
	private _storedBaseID: ULID;
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	get storedBaseID(): ULID { return this._storedBaseID; }
	set storedBaseID( baseID: ULID ) {
		this._storedBaseID = baseID;
	}

	/**
	 * @return {Observable}
	 */
	public getListNotification(
		params: NotificationQuery
	): Observable<Notification[]> {
		return this._apiService.call(
			`${this._endPoint}/list`,
			'GET',
			params
		);
	}

	/**
	 * @return {Observable}
	 */
	public countNotification(): Observable<NotificationCount> {
		return this._apiService.call(
			`${this._endPoint}/count`,
			'GET'
		);
	}

	/**
	 * @return {Observable}
	 */
	public markAsRead( id: ULID ): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/mask-as-read/${id}`,
			'PATCH'
		);
	}

	/**
	 * @return {Observable}
	 */
	public markAllAsRead(): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/mask-all-as-read`,
			'PATCH'
		);
	}

}
