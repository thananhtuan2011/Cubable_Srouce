import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ULID } from 'ulidx';
import _ from 'lodash';

import { WorkspaceApiService } from '@main/workspace/services';

@Injectable()
export class BaseRoleService {

	private readonly _endPoint: string = '/api/base-role';
	private readonly _apiService: WorkspaceApiService = inject( WorkspaceApiService );

	/**
	 * @param {ULID} roleID
	 * @param {ULID[]} userIDs
	 * @param {ULID[]} teamIDs
	 * @return {Observable}
	 */
	public invite( roleID: ULID, userIDs?: ULID[], teamIDs?: ULID[] ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/invite-users-teams/${roleID}`, 'PUT', { userIDs, teamIDs } );
	}

	/**
	 * @param {ULID} baseID
	 * @param {ULID} userIDs
	 * @param {ULID} teamIDs
	 * @return {Observable}
	 */
	public remove( baseID: ULID, userIDs?: ULID[], teamIDs?: ULID[] ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/remove-users-teams/${baseID}`, 'PUT', { userIDs, teamIDs } );
	}

}
