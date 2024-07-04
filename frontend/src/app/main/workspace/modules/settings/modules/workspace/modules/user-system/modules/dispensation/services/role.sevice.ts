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
	IRoleExtra,
	IRole,
	UpdateRoleMember,
	Role
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

@Injectable()
export class RoleService {

	private readonly _endPoint: string = '/api/role';

	public readonly rolesDefault: ReadonlyMap<string, Pick<IRole, 'name' | 'uniqName' | 'description'>>
		= new Map([
			[
				CONSTANT.ROLE_UNIQ_NAME.ADMIN,
				{
					name: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.LABEL.ADMIN',
					uniqName: CONSTANT.ROLE_UNIQ_NAME.ADMIN,
					description: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.MESSAGE.ADMIN_DESCRIPTION',
				},
			],
			[
				CONSTANT.ROLE_UNIQ_NAME.MEMBER,
				{
					name: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.LABEL.MEMBER',
					uniqName: CONSTANT.ROLE_UNIQ_NAME.MEMBER,
					description: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.MESSAGE.MEMBER_DESCRIPTION',
				},
			],
			[
				CONSTANT.ROLE_UNIQ_NAME.GUEST,
				{
					name: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.LABEL.GUEST',
					uniqName: CONSTANT.ROLE_UNIQ_NAME.GUEST,
					description: 'SETTINGS.WORKSPACE.USER_SYSTEM.DISPENSATION.MESSAGE.GUEST_DESCRIPTION',
				},
			],
		]);

	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @return {Observable}
	 */
	public get(): Observable<Role[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list`,
			'GET'
		);
	}

	/**
	 * @return {Observable}
	 */
	public getResource(): Observable<IRole[]> {
		return this._apiService
		.call(
			`${this._endPoint}/resources`,
			'GET'
		);
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public detail(
		id: string
	): Observable<IRoleExtra> {
		return this._apiService
		.call(
			`${this._endPoint}/detail/${id}`,
			'GET'
		);
	}

	/**
 	* @param {ULID} roleID
 	* @param {InviteUser} data
 	* @return {void}
 	*/
	public addMember(
		roleID: ULID,
		data: UpdateRoleMember
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/add-member/${roleID}`,
			'POST',
			data
		);
	}

	/**
	 * @param {ULID} roleID
	 * @param {UpdateRoleMember} data
	 * @return {void}
	 */
	public removeMember(
		roleID: ULID,
		data: UpdateRoleMember
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/remove-member/${roleID}`,
			'POST',
			data
		);
	}

	/**
	 * @param {string} id
	 * @return {Observable}
	 */
	public delete(
		id: string
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/delete/${id}`,
			'DELETE'
		);
	}

	/**
	 * @param {ULID[]} roleID
	 * @return {Observable}
	 */
	public activate(
		roleID: ULID
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/activate/${roleID}`,
			'PUT'
		);
	}

	/**
	 * @param {ULID[]} roleID
	 * @return {Observable}
	 */
	public deactivate(
		roleID: ULID
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/deactivate/${roleID}`,
			'PUT'
		);
	}

}
